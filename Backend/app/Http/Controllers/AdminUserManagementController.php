<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Candidate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class AdminUserManagementControllerTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsAdmin()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        return $this->actingAs($admin, 'api-users');
    }

    // ✅ TEST 1 - Lister tous les utilisateurs
    public function test_admin_can_get_all_users()
    {
        User::factory()->count(3)->create();

        $response = $this->actingAsAdmin()->getJson('/api/admin/users');

        $response->assertStatus(200)
                 ->assertJsonStructure(['users', 'total']);
    }

    // ✅ TEST 2 - Lister tous les candidats
    public function test_admin_can_get_all_candidates()
    {
        Candidate::factory()->count(3)->create();

        $response = $this->actingAsAdmin()->getJson('/api/admin/candidates');

        $response->assertStatus(200)
                 ->assertJsonStructure(['candidates', 'total']);
    }

    // ✅ TEST 3 - Statistiques utilisateurs
    public function test_admin_can_get_user_statistics()
    {
        $response = $this->actingAsAdmin()->getJson('/api/admin/statistics');

        $response->assertStatus(200)
                 ->assertJsonStructure(['statistics', 'recent_candidates', 'recent_users']);
    }

    // ✅ TEST 4 - Créer un utilisateur
    public function test_admin_can_create_user()
    {
        $response = $this->actingAsAdmin()->postJson('/api/admin/users', [
            'name' => 'Manager Test',
            'email' => 'manager@example.com',
            'password' => 'password123',
            'role' => 'contest_manager',
        ]);

        $response->assertStatus(201)
                 ->assertJson(['message' => 'User created successfully']);

        $this->assertDatabaseHas('users', ['email' => 'manager@example.com']);
    }

    // ✅ TEST 5 - Créer avec données invalides
    public function test_create_user_fails_with_invalid_data()
    {
        $response = $this->actingAsAdmin()->postJson('/api/admin/users', []);
        $response->assertStatus(422);
    }

    // ✅ TEST 6 - Modifier un utilisateur
    public function test_admin_can_update_user()
    {
        $user = User::factory()->create();

        $response = $this->actingAsAdmin()->putJson("/api/admin/users/{$user->id}", [
            'name' => 'Nouveau Nom',
        ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'User updated successfully']);
    }

    // ✅ TEST 7 - Modifier utilisateur inexistant
    public function test_update_user_returns_404_if_not_found()
    {
        $response = $this->actingAsAdmin()->putJson('/api/admin/users/9999', [
            'name' => 'Test',
        ]);

        $response->assertStatus(404);
    }

    // ✅ TEST 8 - Changer le rôle
    public function test_admin_can_change_user_role()
    {
        $user = User::factory()->create(['role' => 'contest_manager']);

        $response = $this->actingAsAdmin()->putJson("/api/admin/users/{$user->id}/role", [
            'role' => 'admin',
        ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'User role updated successfully']);
    }

    // ✅ TEST 9 - Activer/désactiver un utilisateur
    public function test_admin_can_toggle_user_status()
    {
        $user = User::factory()->create(['is_active' => true]);

        $response = $this->actingAsAdmin()->putJson("/api/admin/users/{$user->id}/toggle-status");

        $response->assertStatus(200)
                 ->assertJson(['message' => 'User status updated successfully']);
    }

    // ✅ TEST 10 - Supprimer un utilisateur
    public function test_admin_can_delete_user()
    {
        User::factory()->count(2)->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'contest_manager']);

        $response = $this->actingAsAdmin()->deleteJson("/api/admin/users/{$user->id}");

        $response->assertStatus(200)
                 ->assertJson(['message' => 'User deleted successfully']);
    }

    // ✅ TEST 11 - Empêcher suppression du dernier admin
    public function test_cannot_delete_last_admin()
    {
        $admin = User::where('role', 'admin')->first()
            ?? User::factory()->create(['role' => 'admin']);

        // S'assurer qu'il n'y a qu'un seul admin
        User::where('role', 'admin')->where('id', '!=', $admin->id)->delete();

        $response = $this->actingAs($admin, 'api-users')
                         ->deleteJson("/api/admin/users/{$admin->id}");

        $response->assertStatus(400);
    }

    // ✅ TEST 12 - Détails d'un candidat
    public function test_admin_can_get_candidate_details()
    {
        $candidate = Candidate::factory()->create();

        $response = $this->actingAsAdmin()->getJson("/api/admin/candidates/{$candidate->id}");

        $response->assertStatus(200)
                 ->assertJsonStructure(['candidate']);
    }

    // ✅ TEST 13 - Candidat inexistant
    public function test_get_candidate_details_returns_404_if_not_found()
    {
        $response = $this->actingAsAdmin()->getJson('/api/admin/candidates/9999');
        $response->assertStatus(404);
    }

    // ✅ TEST 14 - Recherche utilisateurs
    public function test_admin_can_search_users()
    {
        User::factory()->create(['name' => 'Jean Martin']);

        $response = $this->actingAsAdmin()->getJson('/api/admin/search?q=Jean');

        $response->assertStatus(200)
                 ->assertJsonStructure(['users', 'candidates']);
    }

    // ✅ TEST 15 - Recherche trop courte
    public function test_search_returns_empty_if_query_too_short()
    {
        $response = $this->actingAsAdmin()->getJson('/api/admin/search?q=J');

        $response->assertStatus(200)
                 ->assertJson(['users' => [], 'candidates' => []]);
    }

    // ✅ TEST 16 - Journal d'activité
    public function test_admin_can_get_activity_log()
    {
        $response = $this->actingAsAdmin()->getJson('/api/admin/activity-log');

        $response->assertStatus(200)
                 ->assertJsonStructure(['activities']);
    }
}
