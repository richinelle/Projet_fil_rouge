<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Department;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DepartmentControllerTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsAuthUser()
    {
        $user = User::factory()->create();
        return $this->actingAs($user, 'api');
    }

    // ✅ TEST 1 - Lister tous les départements
    public function test_can_get_all_departments()
    {
        Department::factory()->count(3)->create();

        $response = $this->actingAsAuthUser()
                         ->getJson('/api/departments');

        $response->assertStatus(200)
                 ->assertJsonStructure(['departments']);
    }

    // ✅ TEST 2 - Créer un département
    public function test_can_create_department()
    {
        $response = $this->actingAsAuthUser()
                         ->postJson('/api/departments', [
                             'name' => 'Informatique',
                             'code' => 'INFO',
                             'description' => 'Département informatique',
                         ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['message', 'department']);

        $this->assertDatabaseHas('departments', ['code' => 'INFO']);
    }

    // ✅ TEST 3 - Créer avec données invalides
    public function test_cannot_create_department_with_invalid_data()
    {
        $response = $this->actingAsAuthUser()
                         ->postJson('/api/departments', []);

        $response->assertStatus(422);
    }

    // ✅ TEST 4 - Afficher un département existant
    public function test_can_show_department()
    {
        $department = Department::factory()->create();

        $response = $this->actingAsAuthUser()
                         ->getJson('/api/departments/' . $department->id);

        $response->assertStatus(200)
                 ->assertJsonStructure(['department']);
    }

    // ✅ TEST 5 - Afficher un département inexistant
    public function test_show_returns_404_if_department_not_found()
    {
        $response = $this->actingAsAuthUser()
                         ->getJson('/api/departments/9999');

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Department not found']);
    }

    // ✅ TEST 6 - Modifier un département
    public function test_can_update_department()
    {
        $department = Department::factory()->create();

        $response = $this->actingAsAuthUser()
                         ->putJson('/api/departments/' . $department->id, [
                             'name' => 'Nouveau nom',
                         ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Department updated successfully']);
    }

    // ✅ TEST 7 - Modifier un département inexistant
    public function test_update_returns_404_if_department_not_found()
    {
        $response = $this->actingAsAuthUser()
                         ->putJson('/api/departments/9999', [
                             'name' => 'Test',
                         ]);

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Department not found']);
    }

    // ✅ TEST 8 - Supprimer un département
    public function test_can_delete_department()
    {
        $department = Department::factory()->create();

        $response = $this->actingAsAuthUser()
                         ->deleteJson('/api/departments/' . $department->id);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Department deleted successfully']);

        $this->assertDatabaseMissing('departments', ['id' => $department->id]);
    }

    // ✅ TEST 9 - Supprimer un département inexistant
    public function test_delete_returns_404_if_department_not_found()
    {
        $response = $this->actingAsAuthUser()
                         ->deleteJson('/api/departments/9999');

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Department not found']);
    }

    // ✅ TEST 10 - Stats d'un département
    public function test_can_get_department_stats()
    {
        $department = Department::factory()->create();

        $response = $this->actingAsAuthUser()
                         ->getJson('/api/departments/' . $department->id . '/stats');

        $response->assertStatus(200)
                 ->assertJsonStructure(['department', 'stats']);
    }

    // ✅ TEST 11 - Stats d'un département inexistant
    public function test_stats_returns_404_if_department_not_found()
    {
        $response = $this->actingAsAuthUser()
                         ->getJson('/api/departments/9999/stats');

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Department not found']);
    }
}
