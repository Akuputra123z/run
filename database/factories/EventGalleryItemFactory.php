<?php

namespace Database\Factories;

use App\Models\EventGalleryItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EventGalleryItem>
 */
class EventGalleryItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'photo_path' => 'gallery/'.fake()->uuid().'.jpg',
            'label' => fake()->randomElement(['START LINE', 'GOODIE BAG', 'PODIUM', 'FINISH AREA']),
            'sort_order' => 0,
        ];
    }
}
