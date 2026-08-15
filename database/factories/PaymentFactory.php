<?php

namespace Database\Factories;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\Registration;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'registration_id' => Registration::factory(),
            'method' => 'transfer',
            'bank' => 'BCA',
            'account_number' => fake()->numerify('############'),
            'account_name' => fake()->name(),
            'amount' => 150000,
            'status' => PaymentStatus::Pending,
        ];
    }
}
