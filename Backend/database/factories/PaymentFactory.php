<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\Candidate;
use App\Models\Contest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
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
            'candidate_id' => Candidate::factory(),
            'contest_id' => Contest::factory(),
            'amount' => $this->faker->numberBetween(10000, 100000),
            'status' => 'completed',
            'payment_method' => $this->faker->randomElement(['credit_card', 'bank_transfer', 'cash']),
            'transaction_id' => $this->faker->unique()->uuid(),
        ];
    }
}
