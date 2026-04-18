<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Enrollment;
use App\Models\Candidate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

class EnrollmentApprovalRejectionTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    public function test_approve_enrollment()
    {
        $candidate = Candidate::factory()->create();
        $enrollment = Enrollment::factory()->create([
            'candidate_id' => $candidate->id,
            'status' => 'submitted'
        ]);

        $response = $this->actingAs($this->admin, 'api-users')
            ->postJson("/api/admin/enrollments/{$enrollment->id}/approve");

        $response->assertStatus(200);
        $this->assertEquals('approved', $enrollment->fresh()->status);
        $this->assertNotNull($enrollment->fresh()->candidate_code);
    }

    public function test_cannot_approve_non_submitted_enrollment()
    {
        $candidate = Candidate::factory()->create();
        $enrollment = Enrollment::factory()->create([
            'candidate_id' => $candidate->id,
            'status' => 'incomplete'
        ]);

        $response = $this->actingAs($this->admin, 'api-users')
            ->postJson("/api/admin/enrollments/{$enrollment->id}/approve");

        $response->assertStatus(400);
    }

    public function test_reject_enrollment()
    {
        $candidate = Candidate::factory()->create();
        $enrollment = Enrollment::factory()->create([
            'candidate_id' => $candidate->id,
            'status' => 'submitted'
        ]);

        $response = $this->actingAs($this->admin, 'api-users')
            ->postJson("/api/admin/enrollments/{$enrollment->id}/reject", [
                'rejection_reason' => 'Documents incomplets'
            ]);

        $response->assertStatus(200);
        $this->assertEquals('rejected', $enrollment->fresh()->status);
        $this->assertEquals('Documents incomplets', $enrollment->fresh()->rejection_reason);
    }

    public function test_reject_enrollment_requires_reason()
    {
        $candidate = Candidate::factory()->create();
        $enrollment = Enrollment::factory()->create([
            'candidate_id' => $candidate->id,
            'status' => 'submitted'
        ]);

        $response = $this->actingAs($this->admin, 'api-users')
            ->postJson("/api/admin/enrollments/{$enrollment->id}/reject", []);

        $response->assertStatus(422);
    }

    public function test_cannot_reject_non_submitted_enrollment()
    {
        $candidate = Candidate::factory()->create();
        $enrollment = Enrollment::factory()->create([
            'candidate_id' => $candidate->id,
            'status' => 'incomplete'
        ]);

        $response = $this->actingAs($this->admin, 'api-users')
            ->postJson("/api/admin/enrollments/{$enrollment->id}/reject", [
                'rejection_reason' => 'Test reason'
            ]);

        $response->assertStatus(400);
    }

    public function test_multiple_enrollments_can_be_approved_independently()
    {
        $candidate1 = Candidate::factory()->create();
        $candidate2 = Candidate::factory()->create();
        
        $enrollment1 = Enrollment::factory()->create([
            'candidate_id' => $candidate1->id,
            'status' => 'submitted'
        ]);
        $enrollment2 = Enrollment::factory()->create([
            'candidate_id' => $candidate2->id,
            'status' => 'submitted'
        ]);

        $this->actingAs($this->admin, 'api-users')
            ->postJson("/api/admin/enrollments/{$enrollment1->id}/approve");

        $this->assertEquals('approved', $enrollment1->fresh()->status);
        $this->assertEquals('submitted', $enrollment2->fresh()->status);

        $this->actingAs($this->admin, 'api-users')
            ->postJson("/api/admin/enrollments/{$enrollment2->id}/approve");

        $this->assertEquals('approved', $enrollment1->fresh()->status);
        $this->assertEquals('approved', $enrollment2->fresh()->status);
        
        $this->assertNotEquals(
            $enrollment1->fresh()->candidate_code,
            $enrollment2->fresh()->candidate_code
        );
    }
}
