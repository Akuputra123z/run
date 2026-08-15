<?php

namespace Database\Factories;

use App\Enums\RegistrationStatus;
use App\Models\Category;
use App\Models\Registration;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Registration>
 */
class RegistrationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => 'KBR-2026-'.strtoupper(fake()->unique()->bothify('####')),
            'category_id' => Category::factory(),
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->numerify('08##########'),
            'nik' => fake()->numerify('################'),
            'gender' => fake()->randomElement(['men', 'women']),
            'birth_date' => fake()->date('Y-m-d', '-18 years'),
            'city' => fake()->city(),
            'jersey_size' => fake()->randomElement(['S', 'M', 'L', 'XL', 'XXL']),
            'emergency_name' => fake()->name(),
            'emergency_phone' => fake()->numerify('08##########'),
            'community' => fake()->optional()->company(),
            'status' => RegistrationStatus::PendingPayment,
            'total_amount' => 150000,
            'payment_due_at' => now()->addHours(24),
        ];
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RegistrationStatus::Verified,
            'race_number' => 'KBR-5K-'.str_pad((string) fake()->unique()->numberBetween(1, 999), 4, '0', STR_PAD_LEFT),
            'paid_at' => now(),
        ]);
    }
}
