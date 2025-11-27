<?php

namespace Tests\Feature;

use App\Models\Car;
use App\Models\Quote;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CarTest extends TestCase
{
	use RefreshDatabase;

	public function test_cars_index_displayed()
	{
		$user = User::factory()->create();
		$car1 = Car::factory()->create(['created_at' => now()->subMinutes(3)]);
		$car2 = Car::factory()->create(['created_at' => now()->subMinutes(2)]);
		$car3 = Car::factory()->create(['created_at' => now()->subMinutes(1)]);

		$response = $this
			->actingAs($user)
			->get('/cars');

		$response->assertStatus(200);

		$response->assertInertia(
			fn(Assert $page) => $page
				->component('Cars/Index')
				->has('cars.data', 3)
				->has(
					'cars.data.0',
					fn(Assert $page) => $page
						->where('id', $car3->id)
						->where('make', $car3->make)
						->where('model', $car3->model)
						->etc()
				)
		);
	}

	public function test_cars_show_displayed_with_quotes()
	{
		$user = User::factory()->create();
		$car = Car::factory()->create();
		$quote1 = Quote::factory()->create(['car_id' => $car->id]);
		$quote2 = Quote::factory()->create(['car_id' => $car->id]);
		$quote3 = Quote::factory()->create(['car_id' => $car->id]);

		$response = $this
			->actingAs($user)
			->get("/cars/{$car->id}");

		$response->assertStatus(200);

		$response->assertInertia(
			fn(Assert $page) => $page
				->component('Cars/Show')
				->has(
					'car',
					fn(Assert $page) => $page
						->where('id', $car->id)
						->where('make', $car->make)
						->where('model', $car->model)
						->has('quotes', 3)
						->where('quotes', function ($quotes) use ($quote1, $quote2, $quote3) {
							return collect($quotes)->contains('id', $quote1->id)
								&& collect($quotes)->contains('id', $quote2->id)
								&& collect($quotes)->contains('id', $quote3->id);
						})
						->etc()
				)
		);
	}
}
