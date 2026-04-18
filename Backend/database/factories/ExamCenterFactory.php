<?php

namespace Database\Factories;

use App\Models\ExamCenter;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ExamCenter>
 */
class ExamCenterFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->company(),
            'address' => $this->faker->address(),
            'city' => $this->faker->city(),
            'country' => $this->faker->country(),
            'contact_phone' => $this->faker->phoneNumber(),
            'contact_email' => $this->faker->email(),
            'capacity' => $this->faker->numberBetween(50, 500),
        ];
    }
}
