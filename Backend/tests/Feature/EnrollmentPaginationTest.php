<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Enrollment;
use App\Models\Candidate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class EnrollmentPaginationTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    public function test_pagination_with_default_parameters()
    {
        $candidates = Candidate::factory(30)->create();
        foreach ($candidates as $candidate) {
            Enrollment::factory()->create(['candidate_id' => $candidate->id]);
        }

        $response = $this->actingAs($this->admin, 'api-users')
            ->getJson('/api/admin/enrollments');

        $response->assertStatus(200);
        $data = $response->json();
        
        $this->assertEquals(30, $data['pagination']['total']);
        $this->assertEquals(15, $data['pagination']['per_page']);
        $this->assertEquals(1, $data['pagination']['current_page']);
        $this->assertEquals(2, $data['pagination']['last_page']);
        $this->assertCount(15, $data['enrollments']);
    }

    public function test_pagination_with_custom_per_page()
    {
        $candidates = Candidate::factory(50)->create();
        foreach ($candidates as $candidate) {
            Enrollment::factory()->create(['candidate_id' => $candidate->id]);
        }

        $response = $this->actingAs($this->admin, 'api-users')
            ->getJson('/api/admin/enrollments?per_page=10');

        $response->assertStatus(200);
        $data = $response->json();
        
        $this->assertEquals(50, $data['pagination']['total']);
        $this->assertEquals(10, $data['pagination']['per_page']);
        $this->assertEquals(5, $data['pagination']['last_page']);
        $this->assertCount(10, $data['enrollments']);
    }

    public function test_pagination_with_page_parameter()
    {
        $candidates = Candidate::factory(45)->create();
        foreach ($candidates as $candidate) {
            Enrollment::factory()->create(['candidate_id' => $candidate->id]);
        }

        $response = $this->actingAs($this->admin, 'api-users')
            ->getJson('/api/admin/enrollments?page=2&per_page=15');

        $response->assertStatus(200);
        $data = $response->json();
        
        $this->assertEquals(45, $data['pagination']['total']);
        $this->assertEquals(2, $data['pagination']['current_page']);
        $this->assertEquals(3, $data['pagination']['last_page']);
        $this->assertEquals(16, $data['pagination']['from']);
        $this->assertEquals(30, $data['pagination']['to']);
        $this->assertCount(15, $data['enrollments']);
    }

    public function test_pagination_with_status_filter()
    {
        $candidates = Candidate::factory(30)->create();
        foreach ($candidates as $index => $candidate) {
            $status = $index < 20 ? 'submitted' : 'approved';
            Enrollment::factory()->create([
                'candidate_id' => $candidate->id,
                'status' => $status
            ]);
        }

        $response = $this->actingAs($this->admin, 'api-users')
            ->getJson('/api/admin/enrollments?status=submitted&per_page=15');

        $response->assertStatus(200);
        $data = $response->json();
        
        $this->assertEquals(20, $data['pagination']['total']);
        $this->assertCount(15, $data['enrollments']);
        
        foreach ($data['enrollments'] as $enrollment) {
            $this->assertEquals('submitted', $enrollment['status']);
        }
    }
public function test_pagination_with_search_by_name()
{
    $candidate1 = Candidate::factory()->create(['first_name' => 'Jean', 'last_name' => 'Dupont']);
    $candidate2 = Candidate::factory()->create(['first_name' => 'Jean', 'last_name' => 'Martin']);
    $candidate3 = Candidate::factory()->create(['first_name' => 'Marie', 'last_name' => 'Dupont']);

    Enrollment::factory()->create([
        'candidate_id' => $candidate1->id,
        'full_name' => 'Jean Dupont'
    ]);
    Enrollment::factory()->create([
        'candidate_id' => $candidate2->id,
        'full_name' => 'Jean Martin'
    ]);
    Enrollment::factory()->create([
        'candidate_id' => $candidate3->id,
        'full_name' => 'Marie Dupont'
    ]);

    $response = $this->actingAs($this->admin, 'api-users')
        ->getJson('/api/admin/enrollments?search=Jean');

    $response->assertStatus(200);
    $data = $response->json();

    $this->assertEquals(2, $data['pagination']['total']);
    $this->assertCount(2, $data['enrollments']);
}

    public function test_pagination_with_empty_results()
    {
        $response = $this->actingAs($this->admin, 'api-users')
            ->getJson('/api/admin/enrollments');

        $response->assertStatus(200);
        $data = $response->json();
        
        $this->assertEquals(0, $data['pagination']['total']);
        $this->assertEquals(0, $data['pagination']['last_page']);
        $this->assertCount(0, $data['enrollments']);
    }
}
