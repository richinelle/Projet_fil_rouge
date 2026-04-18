<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Filiere;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Filiere>
 */
class FiliereFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->word(),
            'description' => $this->faker->sentence(),
            'department_id' => Department::factory(),
            'code' => $this->faker->unique()->bothify('FIL-####'),
        ];
    }
}
