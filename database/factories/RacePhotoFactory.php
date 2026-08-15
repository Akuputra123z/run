<?php

namespace Database\Factories;

use App\Models\RacePhoto;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RacePhoto>
 */
class RacePhotoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'photo_path' => 'race-photos/foto-'.fake()->uuid().'.jpg',
            'photographer' => fake()->name(),
        ];
    }
}
