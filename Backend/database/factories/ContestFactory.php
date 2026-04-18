<?php

namespace Database\Factories;

use App\Models\Contest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Contest>
 */
class ContestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $registrationStart = $this->faker->dateTimeBetween('+1 day', '+5 days');
        $registrationEnd = $this->faker->dateTimeBetween('+6 days', '+15 days');
        $contestDate = $this->faker->dateTimeBetween('+16 days', '+60 days');

        return [
            'user_id' => User::factory(),
            'title' => $this->faker->word(),
            'description' => $this->faker->sentence(),
            'requirements' => $this->faker->paragraph(),
            'max_participants' => $this->faker->numberBetween(50, 500),
            'registration_fee' => $this->faker->numberBetween(1000, 50000),
            'registration_start_date' => $registrationStart,
            'registration_end_date' => $registrationEnd,
            'contest_date' => $contestDate,
            'location' => $this->faker->city(),
            'status' => 'open',
            'prizes' => $this->faker->paragraph(),
            'contact_email' => $this->faker->email(),
            'contact_phone' => $this->faker->phoneNumber(),
        ];
    }
}
