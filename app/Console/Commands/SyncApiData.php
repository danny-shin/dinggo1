<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Car;
use App\Models\Quote;

class SyncApiData extends Command
{
	protected $signature = 'sync:api-data';
	protected $description = 'Fetch cars and quotes, sync to DB, and log statistics.';

	protected array $stats = [
		'cars' => [
			'read'      => 0,
			'inserted'  => 0,
			'updated'   => 0,
			'unchanged' => 0,
		],
		'quotes' => [
			'read'      => 0,
			'inserted'  => 0,
			'updated'   => 0,
			'unchanged' => 0,
		]
	];

	public function handle()
	{
		// 1. Load credentials from .env
		$username = env('DINGGO_API_USER');
		$key      = env('DINGGO_API_KEY');
		$baseUrl  = rtrim(env('DINGGO_API_URL'), '/'); // Ensure no trailing slash

		// Validation to ensure .env is set
		if (!$username || !$key || !$baseUrl) {
			$this->error('Missing API credentials in .env file.');
			return Command::FAILURE;
		}

		$userCreds = [
			"username" => $username,
			"key"      => $key
		];

		$this->info("Starting sync process from: {$baseUrl}");

		// ---------------------------------------------------------
		// 2. Fetch Cars
		// ---------------------------------------------------------
		$this->info('Fetching Cars API...');

		// Dynamic URL
		$carsResponse = Http::post("{$baseUrl}/cars", $userCreds);

		if ($carsResponse->failed()) {
			$this->error('Failed to connect to Cars API.');
			return Command::FAILURE;
		}

		$carsData = $carsResponse->json()['cars'] ?? [];
		$this->stats['cars']['read'] = count($carsData);

		$bar = $this->output->createProgressBar(count($carsData));
		$bar->start();

		foreach ($carsData as $carRow) {

			$car = Car::firstOrNew([
				'license_plate' => $carRow['licensePlate'],
				'license_state' => $carRow['licenseState']
			]);

			$car->fill([
				'vin'    => $carRow['vin'],
				'year'   => $carRow['year'],
				'colour' => $carRow['colour'],
				'make'   => $carRow['make'],
				'model'  => $carRow['model'],
			]);

			if (! $car->exists) {
				$this->stats['cars']['inserted']++;
				$car->save();
			} elseif ($car->isDirty()) {
				$this->stats['cars']['updated']++;
				$car->save();
			} else {
				$this->stats['cars']['unchanged']++;
			}

			// Pass the base URL and creds to the helper
			$this->processQuotesForCar($baseUrl, $userCreds, $car);

			$bar->advance();
		}

		$bar->finish();
		$this->newLine(2);

		// ---------------------------------------------------------
		// 3. Display Results
		// ---------------------------------------------------------
		$this->info('Sync Statistics:');

		$this->table(
			['Table', 'Read (Total)', 'Inserted (New)', 'Updated (Changed)', 'Unchanged'],
			[
				[
					'Cars',
					$this->stats['cars']['read'],
					$this->stats['cars']['inserted'],
					$this->stats['cars']['updated'],
					$this->stats['cars']['unchanged']
				],
				[
					'Quotes',
					$this->stats['quotes']['read'],
					$this->stats['quotes']['inserted'],
					$this->stats['quotes']['updated'],
					$this->stats['quotes']['unchanged']
				],
			]
		);

		return Command::SUCCESS;
	}

	private function processQuotesForCar($baseUrl, $userCreds, Car $car)
	{
		$quotePayload = array_merge($userCreds, [
			"licensePlate" => $car->license_plate,
			"licenseState" => $car->license_state
		]);

		// Dynamic URL
		$quotesResponse = Http::post("{$baseUrl}/quotes", $quotePayload);

		if ($quotesResponse->successful()) {
			$quotesData = $quotesResponse->json()['quotes'] ?? [];

			$this->stats['quotes']['read'] += count($quotesData);

			foreach ($quotesData as $quoteRow) {

				$quote = Quote::firstOrNew([
					'car_id'   => $car->id,
					'repairer' => $quoteRow['repairer']
				]);

				$quote->fill([
					'price'            => $quoteRow['price'],
					'overview_of_work' => $quoteRow['overviewOfWork']
				]);

				if (! $quote->exists) {
					$this->stats['quotes']['inserted']++;
					$quote->save();
				} elseif ($quote->isDirty()) {
					$this->stats['quotes']['updated']++;
					$quote->save();
				} else {
					$this->stats['quotes']['unchanged']++;
				}
			}
		}
	}
}
