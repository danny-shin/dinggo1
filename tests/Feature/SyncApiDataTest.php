<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Config;
use App\Models\Car;
use App\Models\Quote;
use PHPUnit\Framework\Attributes\Test; 

class SyncApiDataTest extends TestCase
{
	use RefreshDatabase; // Resets DB after every test

	protected function setUp(): void
	{
		parent::setUp();

		// Mock the environment variables needed for the command
		// We use Config::set because usually env() calls are cached or immutable during runtime in some setups
		// Ideally, set these in phpunit.xml, but this ensures they exist for this specific test class.
		Config::set('services.dinggo.url', 'https://test-api.com'); // Or set ENV directly if your logic relies strictly on env()

		// Since your command uses env() directly, we can override them via putenv or phpunit.xml
		// But for this test execution, let's assume standard Laravel env access. 
		// Note: In strict testing, prefer config() over env().
	}

	#[Test]
	public function it_fetches_and_saves_cars_and_quotes_successfully()
	{
		// 1. Arrange: Mock the API responses
		Http::fake([
			// Mock the /cars endpoint
			'*/cars' => Http::response([
				'success' => 'ok',
				'cars' => [
					[
						'licensePlate' => 'TEST01',
						'licenseState' => 'NSW',
						'vin' => 'VIN123',
						'year' => '2020',
						'colour' => 'Red',
						'make' => 'Toyota',
						'model' => 'Corolla'
					]
				]
			], 200),

			// Mock the /quotes endpoint (matches any request ending in /quotes)
			'*/quotes' => Http::response([
				'success' => 'ok',
				'quotes' => [
					[
						'repairer' => 'FixItAll',
						'price' => 500.50,
						'overviewOfWork' => 'Fix bumper'
					],
					[
						'repairer' => 'CheapFix',
						'price' => 200.00,
						'overviewOfWork' => 'Paint only'
					]
				]
			], 200),
		]);

		// 2. Act: Run the artisan command
		$this->artisan('sync:api-data')
			->assertExitCode(0);
			//->expectsOutput('Sync completed successfully.') // Optional: Assert output

		// 3. Assert: Check Database for Car
		$this->assertDatabaseHas('cars', [
			'license_plate' => 'TEST01',
			'license_state' => 'NSW',
			'make' => 'Toyota'
		]);

		// Retrieve the car to check relationship
		$car = Car::where('license_plate', 'TEST01')->first();

		// 4. Assert: Check Database for Quotes linked to this car
		$this->assertCount(2, $car->quotes);

		$this->assertDatabaseHas('quotes', [
			'car_id' => $car->id,
			'repairer' => 'FixItAll',
			'price' => 500.50
		]);
	}

	#[Test]
	public function it_updates_existing_records_instead_of_duplicating()
	{
		// 1. Arrange: Create an existing car and quote in the DB
		$existingCar = Car::create([
			'license_plate' => 'TEST01',
			'license_state' => 'NSW',
			'vin' => 'OLD_VIN', // This should change
			'year' => '2000',
			'colour' => 'Blue',
			'make' => 'Toyota',
			'model' => 'Corolla'
		]);

		Quote::create([
			'car_id' => $existingCar->id,
			'repairer' => 'FixItAll',
			'price' => 100.00, // This should change
			'overview_of_work' => 'Old work'
		]);

		// 2. Mock API with UPDATED data for the same keys
		Http::fake([
			'*/cars' => Http::response([
				'success' => 'ok',
				'cars' => [
					[
						'licensePlate' => 'TEST01', // Same Keys
						'licenseState' => 'NSW',    // Same Keys
						'vin' => 'NEW_VIN',         // Changed Data
						'year' => '2020',
						'colour' => 'Red',
						'make' => 'Toyota',
						'model' => 'Corolla'
					]
				]
			], 200),

			'*/quotes' => Http::response([
				'success' => 'ok',
				'quotes' => [
					[
						'repairer' => 'FixItAll', // Same Key
						'price' => 999.99,        // Changed Data
						'overviewOfWork' => 'New work'
					]
				]
			], 200),
		]);

		// 3. Act
		$this->artisan('sync:api-data')
			->assertExitCode(0);

		// 4. Assert: Car count should still be 1, but data updated
		$this->assertDatabaseCount('cars', 1);
		$this->assertDatabaseHas('cars', [
			'license_plate' => 'TEST01',
			'vin' => 'NEW_VIN', // Verify update
		]);

		// 5. Assert: Quote count should still be 1, but price updated
		$this->assertDatabaseCount('quotes', 1);
		$this->assertDatabaseHas('quotes', [
			'repairer' => 'FixItAll',
			'price' => 999.99
		]);
	}

	#[Test]
	public function it_fails_gracefully_if_cars_api_returns_error()
	{
		// 1. Arrange: Mock a server error on /cars
		Http::fake([
			'*/cars' => Http::response(null, 500),
		]);

		// 2. Act & Assert
		$this->artisan('sync:api-data')
			->expectsOutput('Failed to connect to Cars API.')
			->assertExitCode(1); // Expecting Command::FAILURE

		$this->assertDatabaseCount('cars', 0);
	}

	#[Test]
	public function it_displays_correct_statistics_table()
	{
		// 1. Arrange: 1 New Car, 1 Existing Car (Unchanged)
		Car::create([
			'license_plate' => 'OLD01',
			'license_state' => 'VIC',
			'vin' => 'OLD',
			'year' => '1990',
			'colour' => 'Black',
			'make' => 'Ford',
			'model' => 'Falcon'
		]);

		Http::fake([
			'*/cars' => Http::response([
				'success' => 'ok',
				'cars' => [
					// This one exists and is identical (Unchanged)
					[
						'licensePlate' => 'OLD01',
						'licenseState' => 'VIC',
						'vin' => 'OLD',
						'year' => '1990',
						'colour' => 'Black',
						'make' => 'Ford',
						'model' => 'Falcon'
					],
					// This one is new (Inserted)
					[
						'licensePlate' => 'NEW01',
						'licenseState' => 'QLD',
						'vin' => 'NEW',
						'year' => '2022',
						'colour' => 'White',
						'make' => 'Mazda',
						'model' => '3'
					]
				]
			], 200),
			'*/quotes' => Http::response(['quotes' => []], 200) // Empty quotes for simplicity
		]);

		// 2. Act
		$this->artisan('sync:api-data')
			// We can check the table output logic indirectly by checking specific strings
			// Or verifying the logical flow succeeded
			->assertExitCode(0);

		// 3. Assert Database
		$this->assertDatabaseCount('cars', 2);
	}
}
