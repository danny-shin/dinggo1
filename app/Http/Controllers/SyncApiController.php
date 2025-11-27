<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;

class SyncApiController extends Controller
{
	/**
	 * Trigger the SyncApiData command and return statistics.
	 */
	public function sync()
	{
		try {
			// Execute the artisan command and capture output
			Artisan::call('sync:api-data');
			$output = Artisan::output();

			// Parse the output to extract statistics
			$stats = $this->parseStats($output);

			return response()->json([
				'success' => true,
				'message' => 'Sync completed successfully',
				'stats' => $stats,
				'output' => $output,
			]);
		} catch (\Exception $e) {
			return response()->json([
				'success' => false,
				'message' => 'Sync failed: ' . $e->getMessage(),
			], 500);
		}
	}

	/**
	 * Parse statistics from command output.
	 */
	private function parseStats($output)
	{
		$stats = [
			'cars' => [
				'read' => 0,
				'inserted' => 0,
				'updated' => 0,
				'unchanged' => 0,
			],
			'quotes' => [
				'read' => 0,
				'inserted' => 0,
				'updated' => 0,
				'unchanged' => 0,
			],
		];

		// Extract lines that contain the table data
		$lines = explode("\n", $output);

		foreach ($lines as $line) {
			// Match lines containing "Cars" or "Quotes" followed by numbers
			if (preg_match('/Cars\s+\|\s+(\d+)\s+\|\s+(\d+)\s+\|\s+(\d+)\s+\|\s+(\d+)/', $line, $matches)) {
				$stats['cars'] = [
					'read' => (int)$matches[1],
					'inserted' => (int)$matches[2],
					'updated' => (int)$matches[3],
					'unchanged' => (int)$matches[4],
				];
			} elseif (preg_match('/Quotes\s+\|\s+(\d+)\s+\|\s+(\d+)\s+\|\s+(\d+)\s+\|\s+(\d+)/', $line, $matches)) {
				$stats['quotes'] = [
					'read' => (int)$matches[1],
					'inserted' => (int)$matches[2],
					'updated' => (int)$matches[3],
					'unchanged' => (int)$matches[4],
				];
			}
		}

		return $stats;
	}
}
