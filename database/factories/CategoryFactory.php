<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['Fun Run', 'Coastal Run', 'Half Marathon']),
            'distance' => fake()->randomElement(['5K', '10K', '21K']),
            'price' => fake()->randomElement([150000, 225000, 350000]),
            'quota' => 500,
        ];
    }
}
