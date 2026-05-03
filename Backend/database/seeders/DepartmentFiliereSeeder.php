<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Filiere;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DepartmentFiliereSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create departments
        $departments = [
            [
                'name' => 'Informatique',
                'code' => 'INFO',
                'description' => 'Département d\'Informatique et Technologie',
            ],
            [
                'name' => 'Génie Civil',
                'code' => 'GC',
                'description' => 'Département de Génie Civil',
            ],
            [
                'name' => 'Électrotechnique',
                'code' => 'ELEC',
                'description' => 'Département d\'Électrotechnique',
            ],
            [
                'name' => 'Gestion',
                'code' => 'GEST',
                'description' => 'Département de Gestion et Administration',
            ],
        ];

        foreach ($departments as $deptData) {
            $dept = Department::create($deptData);

            // Create filieres for each department
            $filieres = $this->getFilieresByDepartment($dept->code);
            foreach ($filieres as $filiereData) {
                $filiereData['department_id'] = $dept->id;
                Filiere::create($filiereData);
            }
        }
    }

    private function getFilieresByDepartment($deptCode)
    {
        $filieresByDept = [
            'INFO' => [
                [
                    'name' => 'Développement Web',
                    'code' => 'INFO-WEB',
                    'description' => 'Spécialisation en développement web et applications',
                ],
                [
                    'name' => 'Systèmes et Réseaux',
                    'code' => 'INFO-SR',
                    'description' => 'Spécialisation en systèmes informatiques et réseaux',
                ],
                [
                    'name' => 'Intelligence Artificielle',
                    'code' => 'INFO-IA',
                    'description' => 'Spécialisation en IA et machine learning',
                ],
            ],
            'GC' => [
                [
                    'name' => 'Structures et Bâtiments',
                    'code' => 'GC-STRUCT',
                    'description' => 'Spécialisation en structures et bâtiments',
                ],
                [
                    'name' => 'Travaux Publics',
                    'code' => 'GC-TP',
                    'description' => 'Spécialisation en travaux publics',
                ],
            ],
            'ELEC' => [
                [
                    'name' => 'Électricité Industrielle',
                    'code' => 'ELEC-IND',
                    'description' => 'Spécialisation en électricité industrielle',
                ],
                [
                    'name' => 'Électronique',
                    'code' => 'ELEC-ELEC',
                    'description' => 'Spécialisation en électronique',
                ],
            ],
            'GEST' => [
                [
                    'name' => 'Gestion d\'Entreprise',
                    'code' => 'GEST-ENT',
                    'description' => 'Spécialisation en gestion d\'entreprise',
                ],
                [
                    'name' => 'Comptabilité',
                    'code' => 'GEST-COMPT',
                    'description' => 'Spécialisation en comptabilité',
                ],
            ],
        ];

        return $filieresByDept[$deptCode] ?? [];
    }
}
