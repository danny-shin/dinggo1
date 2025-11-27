<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Car>
 */
class CarFactory extends Factory
{
	/**
	 * Define the model's default state.
	 *
	 * @return array<string, mixed>
	 */
	public function definition(): array
	{
		return [
			'make' => $this->faker->word(),
			'model' => $this->faker->word(),
			'year' => $this->faker->year(),
			'colour' => $this->faker->colorName(),
			'vin' => $this->faker->bothify('1#############'),
			'license_plate' => $this->faker->bothify('???-###'),
			'license_state' => $this->faker->stateAbbr(),
		];
	}
}
