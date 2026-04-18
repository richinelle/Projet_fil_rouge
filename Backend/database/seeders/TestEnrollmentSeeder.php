<?php

namespace Database\Seeders;

use App\Models\Enrollment;
use Illuminate\Database\Seeder;

class TestEnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        // Create a test enrollment with submitted status
        Enrollment::create([
            'candidate_id' => 1,
            'full_name' => 'Test Candidate For Approval',
            'date_of_birth' => '2000-01-01',
            'gender' => 'male',
            'nationality' => 'Camerounaise',
            'id_number' => 'TEST-'.time(),
            'id_type' => 'passport',
            'cni_number' => '987654',
            'address' => 'Test Address',
            'city' => 'Douala',
            'country' => 'Cameroun',
            'postal_code' => '12345',
            'education_level' => 'bachelor',
            'school_name' => 'Test School',
            'field_of_study' => 'Test Field',
            'department_id' => 1,
            'filiere_id' => 1,
            'exam_center_id' => 1,
            'deposit_center_id' => 1,
            'emergency_contact_name' => 'Test Contact',
            'emergency_contact_phone' => '123456789',
            'emergency_contact_relationship' => 'Friend',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);
    }
}
