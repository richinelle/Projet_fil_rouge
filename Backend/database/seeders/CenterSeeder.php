<?php

namespace Database\Seeders;

use App\Models\ExamCenter;
use App\Models\DepositCenter;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CenterSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create exam centers
        $examCenters = [
            [
                'name' => 'Centre d\'Examen Principal',
                'address' => 'Rue de la Paix, Dakar',
                'city' => 'Dakar',
                'country' => 'Sénégal',
                'capacity' => 500,
                'contact_phone' => '+221 33 123 45 67',
                'contact_email' => 'exam-dakar@example.com',
            ],
            [
                'name' => 'Centre d\'Examen Thiès',
                'address' => 'Avenue Lamine Guèye, Thiès',
                'city' => 'Thiès',
                'country' => 'Sénégal',
                'capacity' => 300,
                'contact_phone' => '+221 33 234 56 78',
                'contact_email' => 'exam-thies@example.com',
            ],
            [
                'name' => 'Centre d\'Examen Kaolack',
                'address' => 'Boulevard de l\'Indépendance, Kaolack',
                'city' => 'Kaolack',
                'country' => 'Sénégal',
                'capacity' => 200,
                'contact_phone' => '+221 33 345 67 89',
                'contact_email' => 'exam-kaolack@example.com',
            ],
        ];

        foreach ($examCenters as $center) {
            ExamCenter::create($center);
        }

        // Create deposit centers
        $depositCenters = [
            [
                'name' => 'Centre de Dépôt Principal',
                'address' => 'Rue de la Paix, Dakar',
                'city' => 'Dakar',
                'country' => 'Sénégal',
                'contact_phone' => '+221 33 111 22 33',
                'contact_email' => 'depot-dakar@example.com',
            ],
            [
                'name' => 'Centre de Dépôt Thiès',
                'address' => 'Avenue Lamine Guèye, Thiès',
                'city' => 'Thiès',
                'country' => 'Sénégal',
                'contact_phone' => '+221 33 222 33 44',
                'contact_email' => 'depot-thies@example.com',
            ],
            [
                'name' => 'Centre de Dépôt Kaolack',
                'address' => 'Boulevard de l\'Indépendance, Kaolack',
                'city' => 'Kaolack',
                'country' => 'Sénégal',
                'contact_phone' => '+221 33 333 44 55',
                'contact_email' => 'depot-kaolack@example.com',
            ],
        ];

        foreach ($depositCenters as $center) {
            DepositCenter::create($center);
        }
    }
}
