<?php

namespace Tests\Feature;

use App\Models\Candidate;
use App\Models\Contest;
use App\Models\Department;
use App\Models\DepositCenter;
use App\Models\EmailDeliveryLog;
use App\Models\Enrollment;
use App\Models\ExamCenter;
use App\Models\Filiere;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class EnrollmentEmailIntegrationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    private function createEnrollmentWithDocuments()
    {
        $user = User::factory()->create();
        $candidate = Candidate::factory()->create(['email' => 'test@example.com']);

        $department = Department::factory()->create();
        $filiere = Filiere::factory()->create(['department_id' => $department->id]);
        $examCenter = ExamCenter::factory()->create();
        $depositCenter = DepositCenter::factory()->create();

        $enrollment = Enrollment::factory()->create([
            'candidate_id' => $candidate->id,
            'department_id' => $department->id,
            'filiere_id' => $filiere->id,
            'exam_center_id' => $examCenter->id,
            'deposit_center_id' => $depositCenter->id,
            'status' => 'incomplete',
        ]);

        // Create required documents
        $enrollment->documents()->create([
            'document_type' => 'bac_transcript',
            'original_filename' => 'bac.pdf',
            'file_path' => '/files/bac.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 1024,
        ]);
        $enrollment->documents()->create([
            'document_type' => 'birth_certificate',
            'original_filename' => 'birth.pdf',
            'file_path' => '/files/birth.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 1024,
        ]);
        $enrollment->documents()->create([
            'document_type' => 'valid_cni',
            'original_filename' => 'cni.pdf',
            'file_path' => '/files/cni.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 1024,
        ]);
        $enrollment->documents()->create([
            'document_type' => 'photo_4x4_1',
            'original_filename' => 'photo1.jpg',
            'file_path' => '/files/photo1.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 512,
        ]);
        $enrollment->documents()->create([
            'document_type' => 'photo_4x4_2',
            'original_filename' => 'photo2.jpg',
            'file_path' => '/files/photo2.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 512,
        ]);
        $enrollment->documents()->create([
            'document_type' => 'photo_4x4_3',
            'original_filename' => 'photo3.jpg',
            'file_path' => '/files/photo3.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 512,
        ]);
        $enrollment->documents()->create([
            'document_type' => 'photo_4x4_4',
            'original_filename' => 'photo4.jpg',
            'file_path' => '/files/photo4.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 512,
        ]);

        // Create payment receipt document
        $paymentDoc = $enrollment->documents()->create([
            'document_type' => 'payment_receipt',
            'original_filename' => 'receipt.pdf',
            'file_path' => '/files/receipt.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 1024,
        ]);

        // Create a contest and payment
        $contest = Contest::factory()->create();
        $paymentDoc->update(['contest_id' => $contest->id]);

        Payment::factory()->create([
            'candidate_id' => $candidate->id,
            'contest_id' => $contest->id,
            'status' => 'completed',
        ]);

        return [
            'user' => $user,
            'candidate' => $candidate,
            'enrollment' => $enrollment,
        ];
    }

    /**
     * Test that email is sent when enrollment is submitted
     */
    public function test_email_is_sent_when_enrollment_is_submitted()
    {
        $data = $this->createEnrollmentWithDocuments();
        $user = $data['user'];
        $enrollment = $data['enrollment'];

        // Submit enrollment
        $this->actingAs($user, 'api')->post('/api/enrollment/submit', []);

        // Verify enrollment status is updated
        $this->assertEquals('submitted', $enrollment->fresh()->status);

        // Verify email delivery log was created (email was sent)
        $log = EmailDeliveryLog::where('enrollment_id', $enrollment->id)->first();
        $this->assertNotNull($log);
    }

    /**
     * Test that email failure does not block enrollment submission
     */
    public function test_email_failure_does_not_block_enrollment_submission()
    {
        Mail::shouldReceive('send')->andThrow(new \Exception('SMTP connection failed'));

        $data = $this->createEnrollmentWithDocuments();
        $user = $data['user'];
        $enrollment = $data['enrollment'];

        // Submit enrollment
        $response = $this->actingAs($user, 'api')->post('/api/enrollment/submit', []);

        // Verify enrollment was still submitted despite email failure
        $this->assertEquals('submitted', $enrollment->fresh()->status);
        $response->assertStatus(200);
    }

    /**
     * Test that email is sent through NotificationService
     */
    public function test_email_is_sent_through_notification_service()
    {
        $data = $this->createEnrollmentWithDocuments();
        $user = $data['user'];
        $enrollment = $data['enrollment'];

        // Submit enrollment
        $this->actingAs($user, 'api')->post('/api/enrollment/submit', []);

        // Verify email delivery log was created
        $log = EmailDeliveryLog::where('enrollment_id', $enrollment->id)->first();
        $this->assertNotNull($log);
    }
}
