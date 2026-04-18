<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer un admin
        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'phone' => '+33612345678',
            'organization' => 'Platform Admin',
            'is_active' => true,
        ]);

        // Créer un responsable de concours
        User::create([
            'name' => 'Responsable Concours',
            'email' => 'manager@example.com',
            'password' => Hash::make('manager123'),
            'role' => 'contest_manager',
            'phone' => '+33687654321',
            'organization' => 'Concours Organization',
            'is_active' => true,
        ]);

        echo "Admin et Contest Manager créés avec succès!\n";
        echo "Admin: admin@example.com / admin123\n";
        echo "Manager: manager@example.com / manager123\n";
    }
}
