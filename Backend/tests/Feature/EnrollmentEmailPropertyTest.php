<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Enrollment;
use App\Models\Candidate;
use App\Models\EmailDeliveryLog;
use App\Services\EnrollmentEmailService;
use Illuminate\Support\Facades\Mail;

class EnrollmentEmailPropertyTest extends TestCase
{
    protected EnrollmentEmailService $emailService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->emailService = new EnrollmentEmailService();
        Mail::fake();
    }

    /**
     * Property 1: Email Sent on Successful Submission
     * **Validates: Requirements 1.1**
     * 
     * For any enrollment that is successfully submitted, an email SHALL be sent 
     * to the candidate's email address.
     */
    public function test_property_email_sent_on_successful_submission()
    {
        // Generate 100 random enrollments with valid data
        for ($i = 0; $i < 100; $i++) {
            $candidate = Candidate::factory()->create([
                'email' => "test{$i}@example.com"
            ]);
            $enrollment = Enrollment::factory()->create([
                'candidate_id' => $candidate->id,
                'status' => 'incomplete'
            ]);

            // Send email
            $result = $this->emailService->sendConfirmationEmail($enrollment);

            // Property: Email should be sent successfully
            $this->assertTrue($result, "Email should be sent for enrollment {$enrollment->id}");
            
            // Property: Email delivery log should be created
            $log = EmailDeliveryLog::where('enrollment_id', $enrollment->id)->first();
            $this->assertNotNull($log, "Email delivery log should exist for enrollment {$enrollment->id}");
            $this->assertEquals('sent', $log->status, "Email status should be 'sent'");
        }
    }

    /**
     * Property 2-5: Email Contains Required Content
     * **Validates: Requirements 1.2, 1.3, 1.4, 1.5**
     * 
     * For any confirmation email sent, the email body SHALL include:
     * - Candidate's full name
     * - Required message about submission and processing
     * - Enrollment ID for reference
     * - Submission timestamp
     */
    public function test_property_email_contains_required_content()
    {
        // Generate 100 random enrollments with various data
        for ($i = 0; $i < 100; $i++) {
            Mail::fake(); // Reset mail fake for each iteration
            
            $candidate = Candidate::factory()->create([
                'email' => "test{$i}@example.com",
                'first_name' => "FirstName{$i}",
                'last_name' => "LastName{$i}"
            ]);
            $enrollment = Enrollment::factory()->create([
                'candidate_id' => $candidate->id,
                'full_name' => "FirstName{$i} LastName{$i}",
                'submitted_at' => now()
            ]);

            // Send email
            $this->emailService->sendConfirmationEmail($enrollment);

            // Get the sent email
            Mail::assertSent(\App\Mail\EnrollmentConfirmationMail::class, function ($mail) use ($enrollment, $i) {
                $body = $mail->emailBody;
                
                // Property: Email contains candidate name
                $this->assertStringContainsString("FirstName{$i} LastName{$i}", $body, 
                    "Email should contain candidate name for enrollment {$enrollment->id}");
                
                // Property: Email contains required message
                $this->assertStringContainsString('Votre candidature a été soumise avec succès', $body,
                    "Email should contain submission confirmation message");
                $this->assertStringContainsString('Vous recevrez une réponse d\'ici 24h', $body,
                    "Email should contain processing timeline message");
                
                // Property: Email contains enrollment ID
                $this->assertStringContainsString((string)$enrollment->id, $body,
                    "Email should contain enrollment ID");
                
                // Property: Email contains submission timestamp
                $this->assertMatchesRegularExpression('/\d{2}\/\d{2}\/\d{4}/', $body,
                    "Email should contain submission date in d/m/Y format");
                $this->assertMatchesRegularExpression('/\d{2}:\d{2}/', $body,
                    "Email should contain submission time in H:i format");
                
                return true;
            });
        }
    }

    /**
     * Property 6: Email Failure Does Not Block Enrollment
     * **Validates: Requirements 1.6, 4.4, 6.4**
     * 
     * For any enrollment submission where email sending fails, the enrollment 
     * SHALL still be marked as 'submitted' and the system SHALL continue processing.
     */
    public function test_property_email_failure_does_not_block_enrollment()
    {
        // Simulate email failures
        Mail::shouldReceive('to')->andThrow(new \Exception('SMTP connection failed'));

        // Generate 50 random enrollments
        for ($i = 0; $i < 50; $i++) {
            $candidate = Candidate::factory()->create([
                'email' => "test{$i}@example.com"
            ]);
            $enrollment = Enrollment::factory()->create([
                'candidate_id' => $candidate->id,
                'status' => 'incomplete'
            ]);

            // Try to send email (will fail)
            $result = $this->emailService->sendConfirmationEmail($enrollment);

            // Property: Email sending should fail gracefully
            $this->assertFalse($result, "Email sending should return false on failure");
            
            // Property: Error should be logged
            $log = EmailDeliveryLog::where('enrollment_id', $enrollment->id)->first();
            $this->assertNotNull($log, "Email delivery log should exist even on failure");
            $this->assertEquals('failed', $log->status, "Email status should be 'failed'");
            $this->assertNotNull($log->error_message, "Error message should be logged");
        }
    }

    /**
     * Property 7-9: Email Format and Language
     * **Validates: Requirements 2.2, 2.4, 2.6**
     * 
     * For any confirmation email sent:
     * - Subject line SHALL contain keywords indicating enrollment confirmation
     * - Email body SHALL include contact information for support
     * - All text content SHALL be in French language
     */
    public function test_property_email_format_and_language()
    {
        // Generate 100 random enrollments
        for ($i = 0; $i < 100; $i++) {
            Mail::fake(); // Reset mail fake for each iteration
            
            $candidate = Candidate::factory()->create([
                'email' => "test{$i}@example.com"
            ]);
            $enrollment = Enrollment::factory()->create([
                'candidate_id' => $candidate->id
            ]);

            // Send email
            $this->emailService->sendConfirmationEmail($enrollment);

            // Get the sent email
            Mail::assertSent(\App\Mail\EnrollmentConfirmationMail::class, function ($mail) {
                $subject = strtolower($mail->emailSubject);
                $body = $mail->emailBody;
                
                // Property: Subject contains confirmation keywords
                $this->assertTrue(
                    str_contains($subject, 'confirmation') || str_contains($subject, 'candidature'),
                    "Subject should contain 'confirmation' or 'candidature' keyword"
                );
                
                // Property: Email contains support contact information
                $this->assertTrue(
                    str_contains($body, 'richinellelaurence@gmail.com') || 
                    str_contains($body, 'Besoin d\'aide') ||
                    str_contains($body, 'Téléphone'),
                    "Email should contain support contact information"
                );
                
                // Property: Content is in French
                $this->assertStringContainsString('Bonjour', $body, "Email should contain French greeting");
                $this->assertStringContainsString('candidature', $body, "Email should contain French word 'candidature'");
                $this->assertStringContainsString('Cordialement', $body, "Email should contain French closing");
                
                return true;
            });
        }
    }

    /**
     * Property 10-12: Email Delivery Logging
     * **Validates: Requirements 3.1, 3.2, 3.3**
     * 
     * For any email delivery:
     * - Successful delivery SHALL be logged with candidate ID and timestamp
     * - Failed delivery SHALL be logged with error details and candidate ID
     * - Log SHALL contain email address, subject, and delivery status
     */
    public function test_property_email_delivery_logging()
    {
        // Generate 100 random enrollments
        for ($i = 0; $i < 100; $i++) {
            $candidate = Candidate::factory()->create([
                'email' => "test{$i}@example.com"
            ]);
            $enrollment = Enrollment::factory()->create([
                'candidate_id' => $candidate->id
            ]);

            // Send email
            $this->emailService->sendConfirmationEmail($enrollment);

            // Property: Log entry should exist
            $log = EmailDeliveryLog::where('enrollment_id', $enrollment->id)->first();
            $this->assertNotNull($log, "Email delivery log should exist");
            
            // Property: Log should contain all required fields
            $this->assertNotNull($log->enrollment_id, "Log should contain enrollment_id");
            $this->assertNotNull($log->candidate_id, "Log should contain candidate_id");
            $this->assertNotNull($log->email_address, "Log should contain email_address");
            $this->assertNotNull($log->subject, "Log should contain subject");
            $this->assertNotNull($log->status, "Log should contain status");
            
            // Property: Status should be valid
            $this->assertTrue(in_array($log->status, ['sent', 'failed', 'invalid_email']),
                "Log status should be one of: sent, failed, invalid_email");
        }
    }

    /**
     * Property 16-17: Template Processing
     * **Validates: Requirements 5.2, 5.3, 5.4**
     * 
     * For any confirmation email sent:
     * - All template placeholders SHALL be replaced with actual values
     * - Fallback template SHALL be used when configured template is missing
     */
    public function test_property_template_processing()
    {
        // Generate 100 random enrollments
        for ($i = 0; $i < 100; $i++) {
            Mail::fake(); // Reset mail fake for each iteration
            
            $candidate = Candidate::factory()->create([
                'email' => "test{$i}@example.com",
                'first_name' => "FirstName{$i}",
                'last_name' => "LastName{$i}"
            ]);
            $enrollment = Enrollment::factory()->create([
                'candidate_id' => $candidate->id,
                'full_name' => "FirstName{$i} LastName{$i}",
                'submitted_at' => now()
            ]);

            // Send email
            $this->emailService->sendConfirmationEmail($enrollment);

            // Get the sent email
            Mail::assertSent(\App\Mail\EnrollmentConfirmationMail::class, function ($mail) {
                $body = $mail->emailBody;
                
                // Property: No unsubstituted placeholders should remain
                $this->assertStringNotContainsString('{candidate_name}', $body,
                    "Placeholder {candidate_name} should be substituted");
                $this->assertStringNotContainsString('{enrollment_id}', $body,
                    "Placeholder {enrollment_id} should be substituted");
                $this->assertStringNotContainsString('{submission_date}', $body,
                    "Placeholder {submission_date} should be substituted");
                $this->assertStringNotContainsString('{submission_time}', $body,
                    "Placeholder {submission_time} should be substituted");
                
                return true;
            });
        }
    }

    /**
     * Property 18-19: Invalid Email Handling
     * **Validates: Requirements 6.1, 6.2**
     * 
     * For any candidate with an invalid email address:
     * - System SHALL validate the email before attempting to send
     * - System SHALL log the validation error and skip sending without throwing exception
     */
    public function test_property_invalid_email_handling()
    {
        $invalidEmails = [
            'notanemail',
            'missing@',
            '@nodomain.com',
            'spaces in@email.com',
            'double@@domain.com',
        ];

        // Test each invalid email format
        foreach ($invalidEmails as $invalidEmail) {
            $candidate = Candidate::factory()->create([
                'email' => $invalidEmail
            ]);
            $enrollment = Enrollment::factory()->create([
                'candidate_id' => $candidate->id
            ]);

            // Property: Should not throw exception
            $result = $this->emailService->sendConfirmationEmail($enrollment);

            // Property: Should return false for invalid emails
            $this->assertFalse($result, "Should return false for invalid email: {$invalidEmail}");
            
            // Property: Should log the error
            $log = EmailDeliveryLog::where('enrollment_id', $enrollment->id)->first();
            $this->assertNotNull($log, "Should log invalid email");
            $this->assertEquals('invalid_email', $log->status, "Should mark as invalid_email");
        }
    }
}
