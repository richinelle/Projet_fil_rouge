<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Enrollment;
use App\Models\Candidate;
use App\Models\EmailDeliveryLog;
use App\Services\EnrollmentEmailService;
use Illuminate\Support\Facades\Mail;

class EnrollmentEmailServiceTest extends TestCase
{
    protected EnrollmentEmailService $emailService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->emailService = new EnrollmentEmailService();
        Mail::fake();
    }

    /**
     * Test that valid email formats are accepted
     */
    public function test_valid_email_formats_are_accepted()
    {
        $candidate = Candidate::factory()->create(['email' => 'test@example.com']);
        $enrollment = Enrollment::factory()->create(['candidate_id' => $candidate->id]);

        $result = $this->emailService->sendConfirmationEmail($enrollment);

        $this->assertTrue($result);
        Mail::assertSent(\App\Mail\EnrollmentConfirmationMail::class);
    }

    /**
     * Test that invalid email formats are rejected
     */
    public function test_invalid_email_formats_are_rejected()
    {
        $candidate = Candidate::factory()->create(['email' => 'invalid-email']);
        $enrollment = Enrollment::factory()->create(['candidate_id' => $candidate->id]);

        $result = $this->emailService->sendConfirmationEmail($enrollment);

        $this->assertFalse($result);
        $log = EmailDeliveryLog::where('enrollment_id', $enrollment->id)->first();
        $this->assertNotNull($log);
        $this->assertEquals('invalid_email', $log->status);
    }

    /**
     * Test that email contains candidate name
     */
    public function test_email_contains_candidate_name()
    {
        $candidate = Candidate::factory()->create([
            'email' => 'test@example.com',
            'first_name' => 'Jean',
            'last_name' => 'Dupont'
        ]);
        $enrollment = Enrollment::factory()->create([
            'candidate_id' => $candidate->id,
            'full_name' => 'Jean Dupont'
        ]);

        $this->emailService->sendConfirmationEmail($enrollment);

        Mail::assertSent(\App\Mail\EnrollmentConfirmationMail::class, function ($mail) {
            return str_contains($mail->emailBody, 'Jean Dupont');
        });
    }

    /**
     * Test that email contains required message
     */
    public function test_email_contains_required_message()
    {
        $candidate = Candidate::factory()->create(['email' => 'test@example.com']);
        $enrollment = Enrollment::factory()->create(['candidate_id' => $candidate->id]);

        $this->emailService->sendConfirmationEmail($enrollment);

        Mail::assertSent(\App\Mail\EnrollmentConfirmationMail::class, function ($mail) {
            $content = $mail->emailBody;
            return str_contains($content, 'Votre candidature a été soumise avec succès et est en cours de traitement') &&
                   str_contains($content, 'Vous recevrez une réponse d\'ici 24h ou veuillez nous contacter');
        });
    }

    /**
     * Test that email contains enrollment ID
     */
    public function test_email_contains_enrollment_id()
    {
        $candidate = Candidate::factory()->create(['email' => 'test@example.com']);
        $enrollment = Enrollment::factory()->create(['candidate_id' => $candidate->id]);

        $this->emailService->sendConfirmationEmail($enrollment);

        Mail::assertSent(\App\Mail\EnrollmentConfirmationMail::class, function ($mail) use ($enrollment) {
            return str_contains($mail->emailBody, (string)$enrollment->id);
        });
    }

    /**
     * Test that email contains submission timestamp
     */
    public function test_email_contains_submission_timestamp()
    {
        $candidate = Candidate::factory()->create(['email' => 'test@example.com']);
        $enrollment = Enrollment::factory()->create([
            'candidate_id' => $candidate->id,
            'submitted_at' => now()
        ]);

        $this->emailService->sendConfirmationEmail($enrollment);

        Mail::assertSent(\App\Mail\EnrollmentConfirmationMail::class, function ($mail) {
            $content = $mail->emailBody;
            // Check for date format (d/m/Y)
            return preg_match('/\d{2}\/\d{2}\/\d{4}/', $content) &&
                   preg_match('/\d{2}:\d{2}/', $content);
        });
    }

    /**
     * Test that successful delivery is logged
     */
    public function test_successful_delivery_is_logged()
    {
        $candidate = Candidate::factory()->create(['email' => 'test@example.com']);
        $enrollment = Enrollment::factory()->create(['candidate_id' => $candidate->id]);

        $this->emailService->sendConfirmationEmail($enrollment);

        $log = EmailDeliveryLog::where('enrollment_id', $enrollment->id)->first();
        $this->assertNotNull($log);
        $this->assertEquals('sent', $log->status);
        $this->assertEquals($candidate->email, $log->email_address);
        $this->assertNotNull($log->sent_at);
    }

    /**
     * Test that failed delivery is logged with error details
     */
    public function test_failed_delivery_is_logged_with_error_details()
    {
        Mail::shouldReceive('send')->andThrow(new \Exception('SMTP connection failed'));

        $candidate = Candidate::factory()->create(['email' => 'test@example.com']);
        $enrollment = Enrollment::factory()->create(['candidate_id' => $candidate->id]);

        $result = $this->emailService->sendConfirmationEmail($enrollment);

        $this->assertFalse($result);
        $log = EmailDeliveryLog::where('enrollment_id', $enrollment->id)->first();
        $this->assertNotNull($log);
        $this->assertEquals('failed', $log->status);
        $this->assertNotNull($log->error_message);
    }

    /**
     * Test that email subject contains confirmation keywords
     */
    public function test_email_subject_contains_confirmation_keywords()
    {
        $candidate = Candidate::factory()->create(['email' => 'test@example.com']);
        $enrollment = Enrollment::factory()->create(['candidate_id' => $candidate->id]);

        $this->emailService->sendConfirmationEmail($enrollment);

        Mail::assertSent(\App\Mail\EnrollmentConfirmationMail::class, function ($mail) {
            $subject = $mail->emailSubject;
            return str_contains(strtolower($subject), 'confirmation') ||
                   str_contains(strtolower($subject), 'candidature');
        });
    }

    /**
     * Test that email contains support contact information
     */
    public function test_email_contains_support_contact_information()
    {
        $candidate = Candidate::factory()->create(['email' => 'test@example.com']);
        $enrollment = Enrollment::factory()->create(['candidate_id' => $candidate->id]);

        $this->emailService->sendConfirmationEmail($enrollment);

        Mail::assertSent(\App\Mail\EnrollmentConfirmationMail::class, function ($mail) {
            $content = $mail->emailBody;
            return str_contains($content, 'richinellelaurence@gmail.com') ||
                   str_contains($content, 'Besoin d\'aide');
        });
    }

    /**
     * Test that email content is in French
     */
    public function test_email_content_is_in_french()
    {
        $candidate = Candidate::factory()->create(['email' => 'test@example.com']);
        $enrollment = Enrollment::factory()->create(['candidate_id' => $candidate->id]);

        $this->emailService->sendConfirmationEmail($enrollment);

        Mail::assertSent(\App\Mail\EnrollmentConfirmationMail::class, function ($mail) {
            $content = $mail->emailBody;
            // Check for French keywords
            return str_contains($content, 'Bonjour') &&
                   str_contains($content, 'candidature') &&
                   str_contains($content, 'Cordialement');
        });
    }

    /**
     * Test that template placeholders are substituted correctly
     */
    public function test_template_placeholders_are_substituted()
    {
        $candidate = Candidate::factory()->create([
            'email' => 'test@example.com',
            'first_name' => 'Marie',
            'last_name' => 'Martin'
        ]);
        $enrollment = Enrollment::factory()->create([
            'candidate_id' => $candidate->id,
            'full_name' => 'Marie Martin',
            'submitted_at' => now()
        ]);

        $this->emailService->sendConfirmationEmail($enrollment);

        Mail::assertSent(\App\Mail\EnrollmentConfirmationMail::class, function ($mail) use ($enrollment) {
            $content = $mail->emailBody;
            // Verify placeholders are replaced
            return !str_contains($content, '{candidate_name}') &&
                   !str_contains($content, '{enrollment_id}') &&
                   !str_contains($content, '{submission_date}') &&
                   !str_contains($content, '{submission_time}');
        });
    }

    /**
     * Test that fallback template is used when configured template is missing
     */
    public function test_fallback_template_is_used_when_missing()
    {
        config(['email-templates.enrollment_confirmation' => null]);

        $candidate = Candidate::factory()->create(['email' => 'test@example.com']);
        $enrollment = Enrollment::factory()->create(['candidate_id' => $candidate->id]);

        $result = $this->emailService->sendConfirmationEmail($enrollment);

        $this->assertTrue($result);
        Mail::assertSent(\App\Mail\EnrollmentConfirmationMail::class);
    }

    /**
     * Test that invalid email does not throw exception
     */
    public function test_invalid_email_does_not_throw_exception()
    {
        $candidate = Candidate::factory()->create(['email' => 'not-an-email']);
        $enrollment = Enrollment::factory()->create(['candidate_id' => $candidate->id]);

        $this->expectNotToPerformAssertions();
        $this->emailService->sendConfirmationEmail($enrollment);
    }

    /**
     * Test that log contains all required fields
     */
    public function test_log_contains_all_required_fields()
    {
        $candidate = Candidate::factory()->create(['email' => 'test@example.com']);
        $enrollment = Enrollment::factory()->create(['candidate_id' => $candidate->id]);

        $this->emailService->sendConfirmationEmail($enrollment);

        $log = EmailDeliveryLog::where('enrollment_id', $enrollment->id)->first();
        $this->assertNotNull($log->enrollment_id);
        $this->assertNotNull($log->candidate_id);
        $this->assertNotNull($log->email_address);
        $this->assertNotNull($log->subject);
        $this->assertNotNull($log->status);
    }
}
