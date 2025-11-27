<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\Depends;

class DinggoApiTest extends TestCase
{
	protected string $baseUrl;
	protected array $credentials;

	// Setup is run before every single test method.
	protected function setUp(): void
	{
		parent::setUp();
		$this->baseUrl = rtrim(env('DINGGO_API_URL'), '/'); // Ensure no trailing slash
		$this->credentials = [
			'username' => env('DINGGO_API_USER'),
			'key'      => env('DINGGO_API_KEY'),
		];
	}

	// Test the /test endpoint (Basic connectivity).
	public function test_api_test_endpoint_returns_success(): void
	{
		$response = Http::acceptJson()->get("{$this->baseUrl}/test");

		// Debug output if request fails
		if ($response->failed()) {
			dump($response->body());
		}

		$this->assertEquals(200, $response->status());
		$this->assertEquals('ok', $response->json('success'));
	}

	// Test the /testcreds endpoint (Credential verification).
	public function test_api_creds_endpoint_returns_success(): void
	{
		$response = HTTP::acceptJson()->post("{$this->baseUrl}/testcreds", $this->credentials);

		$this->assertEquals(200, $response->status());
		$this->assertEquals('ok', $response->json('success'));
	}

	// Test the /cars endpoint.
	public function test_api_cars_endpoint_returns_success(): array
	{
		// $response = HTTP::acceptJson()->post("{$this->baseUrl}/cars", $this->credentials);
		$response = HTTP::post("{$this->baseUrl}/cars", $this->credentials);

		$this->assertEquals(200, $response->status());
		$this->assertEquals('ok', $response->json('success'));

		// 2. Extract the car list. 
		$cars = $response->json('cars') ?? $response->json('data');

		$this->assertIsArray($cars, 'Response should contain a list of cars');
		$this->assertNotEmpty($cars, 'Car list should not be empty');

		// 3. Pick the first car to use for the quote test
		$targetCar = $cars[0];

		// Ensure the required fields exist
		$this->assertArrayHasKey('licensePlate', $targetCar);
		$this->assertArrayHasKey('licenseState', $targetCar);

		// 4. Return the specific data needed for the next test
		return [
			'licensePlate' => $targetCar['licensePlate'],
			'licenseState' => $targetCar['licenseState'],
		];
	}

	#[Depends('test_api_cars_endpoint_returns_success')] // <--- Use Attribute instead of @depends comment
	public function test_api_quotes_endpoint_returns_success(array $carData): void
	{
		// 5. Merge the credentials with the car data passed from the previous test
		$payload = array_merge($this->credentials, $carData);
		$response = HTTP::acceptJson()->post("{$this->baseUrl}/quotes", $payload);

		// Debug output if it fails
		// if ($response->failed()) {
		dump($response->body());
		// }

		$this->assertEquals(200, $response->status());
		$this->assertEquals('ok', $response->json('success'));
	}

	// Test that invalid credentials return an error response.
	public function test_api_returns_error_with_invalid_credentials(): void
	{
		$invalidCreds = [
			'username' => 'daniel.dongsoo.shin@gmail.com',
			'key'      => 'wrong-password',
		];

		$response = Http::acceptJson()->post("{$this->baseUrl}/testcreds", $invalidCreds);

		$this->assertEquals(200, $response->status());
		$this->assertEquals('error', $response->json('success'));
	}
}
