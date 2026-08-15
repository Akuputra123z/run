<?php

namespace Database\Factories;

use App\Models\RouteMap;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RouteMap>
 */
class RouteMapFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->randomElement(['10 KM', '5 KM']),
            'description' => fake()->sentence(),
            'sort_order' => 0,
        ];
    }
}
