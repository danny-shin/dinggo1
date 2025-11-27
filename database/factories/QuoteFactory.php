<?php

namespace Database\Factories;

use App\Models\Car;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Quote>
 */
class QuoteFactory extends Factory
{
	/**
	 * Define the model's default state.
	 *
	 * @return array<string, mixed>
	 */
	public function definition(): array
	{
		return [
			'car_id' => Car::factory(),
			'price' => $this->faker->randomFloat(2, 100, 5000),
			'repairer' => $this->faker->company(),
			'overview_of_work' => $this->faker->sentence(),
		];
	}
}
