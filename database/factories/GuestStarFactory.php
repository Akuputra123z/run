<?php

namespace Database\Factories;

use App\Models\GuestStar;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GuestStar>
 */
class GuestStarFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'role' => fake()->randomElement(['DUTA LARI\nREMBANG', 'HOST', 'PERFORMER']),
            'color' => fake()->randomElement(['#C6242D', '#FFC93C']),
            'sort_order' => 0,
        ];
    }
}
