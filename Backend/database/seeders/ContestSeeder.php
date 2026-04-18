<?php

namespace Database\Seeders;

use App\Models\Contest;
use App\Models\Department;
use App\Models\DepositCenter;
use App\Models\ExamCenter;
use App\Models\Filiere;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ContestSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Get admin user or create one
        $admin = User::where('role', 'contest_manager')->first() ?? User::first();

        // Get all departments, filieres, and centers
        $departments = Department::all();
        $filieres = Filiere::all();
        $examCenters = ExamCenter::all();
        $depositCenters = DepositCenter::all();

        // Create 8 contests
        $contests = [
            [
                'user_id' => $admin->id,
                'title' => 'Concours Développement Web 2026',
                'description' => 'Concours de recrutement pour les développeurs web. Testez vos compétences en HTML, CSS, JavaScript et frameworks modernes.',
                'requirements' => 'Bac+2 minimum en informatique',
                'registration_fee' => 25000,
                'registration_start_date' => now()->addDays(5),
                'registration_end_date' => now()->addDays(35),
                'contest_date' => now()->addDays(50),
                'location' => 'Dakar',
                'status' => 'open',
                'contact_email' => 'web@sgee.sn',
                'contact_phone' => '+221 33 123 45 67',
                'min_age' => 18,
                'max_age' => 35,
                'filiere_id' => $filieres->where('code', 'INFO-WEB')->first()?->id,
                'department_id' => $departments->where('code', 'INFO')->first()?->id,
                'exam_center_id' => $examCenters->first()?->id,
                'deposit_center_id' => $depositCenters->first()?->id,
            ],
            [
                'user_id' => $admin->id,
                'title' => 'Concours Systèmes et Réseaux 2026',
                'description' => 'Concours pour les spécialistes en systèmes informatiques et réseaux. Démontrez votre expertise en administration système et sécurité réseau.',
                'requirements' => 'Bac+2 minimum en informatique',
                'registration_fee' => 30000,
                'registration_start_date' => now()->addDays(7),
                'registration_end_date' => now()->addDays(37),
                'contest_date' => now()->addDays(52),
                'location' => 'Thiès',
                'status' => 'open',
                'contact_email' => 'sr@sgee.sn',
                'contact_phone' => '+221 33 234 56 78',
                'min_age' => 20,
                'max_age' => 40,
                'filiere_id' => $filieres->where('code', 'INFO-SR')->first()?->id,
                'department_id' => $departments->where('code', 'INFO')->first()?->id,
                'exam_center_id' => $examCenters->skip(1)->first()?->id,
                'deposit_center_id' => $depositCenters->skip(1)->first()?->id,
            ],
            [
                'user_id' => $admin->id,
                'title' => 'Concours Intelligence Artificielle 2026',
                'description' => 'Concours pour les chercheurs et développeurs en IA. Appliquez vos connaissances en machine learning et deep learning.',
                'requirements' => 'Bac+3 minimum en informatique',
                'registration_fee' => 35000,
                'registration_start_date' => now()->addDays(10),
                'registration_end_date' => now()->addDays(40),
                'contest_date' => now()->addDays(55),
                'location' => 'Dakar',
                'status' => 'open',
                'contact_email' => 'ia@sgee.sn',
                'contact_phone' => '+221 33 123 45 67',
                'min_age' => 21,
                'max_age' => 45,
                'filiere_id' => $filieres->where('code', 'INFO-IA')->first()?->id,
                'department_id' => $departments->where('code', 'INFO')->first()?->id,
                'exam_center_id' => $examCenters->first()?->id,
                'deposit_center_id' => $depositCenters->first()?->id,
            ],
            [
                'user_id' => $admin->id,
                'title' => 'Concours Génie Civil - Structures 2026',
                'description' => 'Concours pour les ingénieurs en génie civil spécialisés en structures. Évaluez vos compétences en conception et calcul de structures.',
                'requirements' => 'Bac+2 minimum en génie civil',
                'registration_fee' => 28000,
                'registration_start_date' => now()->addDays(8),
                'registration_end_date' => now()->addDays(38),
                'contest_date' => now()->addDays(53),
                'location' => 'Thiès',
                'status' => 'open',
                'contact_email' => 'gc-struct@sgee.sn',
                'contact_phone' => '+221 33 234 56 78',
                'min_age' => 19,
                'max_age' => 38,
                'filiere_id' => $filieres->where('code', 'GC-STRUCT')->first()?->id,
                'department_id' => $departments->where('code', 'GC')->first()?->id,
                'exam_center_id' => $examCenters->skip(1)->first()?->id,
                'deposit_center_id' => $depositCenters->skip(1)->first()?->id,
            ],
            [
                'user_id' => $admin->id,
                'title' => 'Concours Travaux Publics 2026',
                'description' => 'Concours pour les professionnels des travaux publics. Testez vos connaissances en gestion de projets et techniques de construction.',
                'requirements' => 'Bac+2 minimum en génie civil',
                'registration_fee' => 26000,
                'registration_start_date' => now()->addDays(6),
                'registration_end_date' => now()->addDays(36),
                'contest_date' => now()->addDays(51),
                'location' => 'Kaolack',
                'status' => 'open',
                'contact_email' => 'tp@sgee.sn',
                'contact_phone' => '+221 33 345 67 89',
                'min_age' => 18,
                'max_age' => 36,
                'filiere_id' => $filieres->where('code', 'GC-TP')->first()?->id,
                'department_id' => $departments->where('code', 'GC')->first()?->id,
                'exam_center_id' => $examCenters->skip(2)->first()?->id,
                'deposit_center_id' => $depositCenters->skip(2)->first()?->id,
            ],
            [
                'user_id' => $admin->id,
                'title' => 'Concours Électricité Industrielle 2026',
                'description' => 'Concours pour les électriciens industriels. Démontrez votre expertise en installations électriques et automatisation industrielle.',
                'requirements' => 'Bac+2 minimum en électrotechnique',
                'registration_fee' => 27000,
                'registration_start_date' => now()->addDays(9),
                'registration_end_date' => now()->addDays(39),
                'contest_date' => now()->addDays(54),
                'location' => 'Dakar',
                'status' => 'open',
                'contact_email' => 'elec-ind@sgee.sn',
                'contact_phone' => '+221 33 123 45 67',
                'min_age' => 19,
                'max_age' => 37,
                'filiere_id' => $filieres->where('code', 'ELEC-IND')->first()?->id,
                'department_id' => $departments->where('code', 'ELEC')->first()?->id,
                'exam_center_id' => $examCenters->first()?->id,
                'deposit_center_id' => $depositCenters->first()?->id,
            ],
            [
                'user_id' => $admin->id,
                'title' => 'Concours Électronique 2026',
                'description' => 'Concours pour les spécialistes en électronique. Appliquez vos connaissances en conception de circuits et microélectronique.',
                'requirements' => 'Bac+2 minimum en électrotechnique',
                'registration_fee' => 29000,
                'registration_start_date' => now()->addDays(11),
                'registration_end_date' => now()->addDays(41),
                'contest_date' => now()->addDays(56),
                'location' => 'Thiès',
                'status' => 'open',
                'contact_email' => 'elec@sgee.sn',
                'contact_phone' => '+221 33 234 56 78',
                'min_age' => 20,
                'max_age' => 39,
                'filiere_id' => $filieres->where('code', 'ELEC-ELEC')->first()?->id,
                'department_id' => $departments->where('code', 'ELEC')->first()?->id,
                'exam_center_id' => $examCenters->skip(1)->first()?->id,
                'deposit_center_id' => $depositCenters->skip(1)->first()?->id,
            ],
            [
                'user_id' => $admin->id,
                'title' => 'Concours Gestion d\'Entreprise 2026',
                'description' => 'Concours pour les gestionnaires d\'entreprise. Testez vos compétences en management, stratégie et gestion financière.',
                'requirements' => 'Bac+2 minimum en gestion',
                'registration_fee' => 24000,
                'registration_start_date' => now()->addDays(12),
                'registration_end_date' => now()->addDays(42),
                'contest_date' => now()->addDays(57),
                'location' => 'Kaolack',
                'status' => 'open',
                'contact_email' => 'gest@sgee.sn',
                'contact_phone' => '+221 33 345 67 89',
                'min_age' => 18,
                'max_age' => 40,
                'filiere_id' => $filieres->where('code', 'GEST-ENT')->first()?->id,
                'department_id' => $departments->where('code', 'GEST')->first()?->id,
                'exam_center_id' => $examCenters->skip(2)->first()?->id,
                'deposit_center_id' => $depositCenters->skip(2)->first()?->id,
            ],
        ];

        foreach ($contests as $contestData) {
            if ($contestData['filiere_id'] && $contestData['department_id'] &&
                $contestData['exam_center_id'] && $contestData['deposit_center_id']) {
                Contest::create($contestData);
            }
        }
    }
}
