<?php

namespace Database\Factories;

use App\Models\Candidate;
use App\Models\Enrollment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Enrollment>
 */
class EnrollmentFactory extends Factory
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
            'full_name' => $this->faker->name(),
            'date_of_birth' => $this->faker->dateTimeBetween('-50 years', '-18 years')->format('Y-m-d'),
            'gender' => $this->faker->randomElement(['male', 'female', 'other']),
            'nationality' => $this->faker->country(),
            'id_number' => $this->faker->unique()->numerify('###########'),
            'id_type' => 'passport',
            'cni_number' => $this->faker->unique()->numerify('###########'),
            'address' => $this->faker->address(),
            'city' => $this->faker->city(),
            'country' => $this->faker->country(),
            'postal_code' => $this->faker->postcode(),
            'education_level' => $this->faker->randomElement(['high_school', 'bachelor', 'master', 'phd']),
            'school_name' => $this->faker->company(),
            'field_of_study' => $this->faker->word(),
            'emergency_contact_name' => $this->faker->name(),
            'emergency_contact_phone' => $this->faker->phoneNumber(),
            'emergency_contact_relationship' => $this->faker->word(),
            'status' => 'incomplete',
            'submitted_at' => null,
        ];
    }
}
