# Design Document: Enrollment Confirmation Email

## Overview

The Enrollment Confirmation Email feature sends an automated confirmation email to candidates when they successfully submit their enrollment. The system integrates with the existing Laravel mail configuration and NotificationService to deliver professional, French-language confirmation emails with candidate details and processing timeline information. The design prioritizes reliability by gracefully handling email failures without blocking enrollment submission.

## Architecture

The email confirmation system follows a layered architecture:

1. **Event Layer**: Enrollment submission triggers the email workflow
2. **Service Layer**: EnrollmentEmailService handles email generation and sending
3. **Template Layer**: Configurable email templates with placeholder substitution
4. **Notification Layer**: Integration with existing NotificationService
5. **Logging Layer**: Comprehensive email delivery tracking and error logging

The system uses Laravel's built-in Mail facade with SMTP configuration from .env, ensuring consistency with existing infrastructure.

## Components and Interfaces

### EnrollmentEmailService

Responsible for sending confirmation emails and managing the email workflow.

```php
class EnrollmentEmailService
{
    /**
     * Send confirmation email for enrollment submission
     * 
     * @param Enrollment $enrollment
     * @return bool Success status
     */
    public function sendConfirmationEmail(Enrollment $enrollment): bool
    
    /**
     * Validate email address format
     * 
     * @param string $email
     * @return bool
     */
    private function validateEmailFormat(string $email): bool
    
    /**
     * Get email template with placeholders
     * 
     * @return array Template with subject and body
     */
    private function getEmailTemplate(): array
    
    /**
     * Replace placeholders in template with actual values
     * 
     * @param string $template
     * @param Enrollment $enrollment
     * @return string
     */
    private function substituteTemplatePlaceholders(string $template, Enrollment $enrollment): string
    
    /**
     * Log email delivery event
     * 
     * @param Enrollment $enrollment
     * @param string $status
     * @param string|null $error
     */
    private function logEmailDelivery(Enrollment $enrollment, string $status, ?string $error = null): void
}
```

### Email Template Structure

Templates support the following placeholders:
- `{candidate_name}`: Full name of the candidate
- `{enrollment_id}`: Unique enrollment identifier
- `{submission_date}`: Formatted submission timestamp
- `{submission_time}`: Formatted submission time

Default template (French):
```
Subject: Confirmation de candidature - Dossier #{enrollment_id}

Body:
Bonjour {candidate_name},

Votre candidature a été soumise avec succès et est en cours de traitement. 
Vous recevrez une réponse d'ici 24h ou veuillez nous contacter.

Détails de votre candidature:
- Numéro de dossier: {enrollment_id}
- Date de soumission: {submission_date} à {submission_time}

Besoin d'aide?
Si vous avez des questions concernant votre candidature, n'hésitez pas à nous contacter:
Email: richinellelaurence@gmail.com
Téléphone: +237 696482594
Horaires: Lundi - Vendredi, 9h00 - 17h00

Cordialement,
L'équipe de traitement des candidatures
```

### Integration Points

**With NotificationService**:
- Called after enrollment status is updated to 'submitted'
- Uses existing notification infrastructure for consistency
- Maintains separation between in-app notifications and email delivery

**With Enrollment Model**:
- Accesses candidate email via `$enrollment->candidate->email`
- Reads enrollment ID, full name, and submission timestamp
- Verifies enrollment status before sending

**With Laravel Mail Configuration**:
- Uses Mail facade with SMTP settings from .env
- Respects MAIL_FROM_ADDRESS and MAIL_FROM_NAME
- Supports queue-based delivery if QUEUE_CONNECTION is configured

## Data Models

### Email Delivery Log

Stores records of all email delivery attempts for auditing and troubleshooting.

```php
class EmailDeliveryLog extends Model
{
    protected $fillable = [
        'enrollment_id',
        'candidate_id',
        'email_address',
        'subject',
        'status',        // 'sent', 'failed', 'invalid_email'
        'error_message',
        'sent_at',
    ];
    
    protected $casts = [
        'sent_at' => 'datetime',
    ];
}
```

### Configuration

Email templates can be stored in:
- **Config file**: `config/email-templates.php` for static templates
- **Database**: `email_templates` table for dynamic templates
- **Fallback**: Hardcoded default template if neither source is available

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Email Sent on Successful Submission

*For any* enrollment that is successfully submitted, an email SHALL be sent to the candidate's email address.

**Validates: Requirements 1.1**

### Property 2: Email Contains Candidate Name

*For any* confirmation email sent, the email body SHALL include the candidate's full name.

**Validates: Requirements 1.2**

### Property 3: Email Contains Required Message

*For any* confirmation email sent, the email body SHALL include the exact message: "Votre candidature a été soumise avec succès et est en cours de traitement. Vous recevrez une réponse d'ici 24h ou veuillez nous contacter"

**Validates: Requirements 1.3**

### Property 4: Email Contains Enrollment ID

*For any* confirmation email sent, the email body SHALL include the enrollment ID for reference.

**Validates: Requirements 1.4**

### Property 5: Email Contains Submission Timestamp

*For any* confirmation email sent, the email body SHALL include the submission timestamp.

**Validates: Requirements 1.5**

### Property 6: Email Failure Does Not Block Enrollment

*For any* enrollment submission where email sending fails, the enrollment SHALL still be marked as 'submitted' and the system SHALL continue processing.

**Validates: Requirements 1.6, 4.4, 6.4**

### Property 7: Email Subject Indicates Confirmation

*For any* confirmation email sent, the subject line SHALL contain keywords indicating enrollment confirmation (e.g., "confirmation", "candidature").

**Validates: Requirements 2.2**

### Property 8: Email Contains Support Contact Information

*For any* confirmation email sent, the email body SHALL include contact information for support in the footer.

**Validates: Requirements 2.4**

### Property 9: Email Content Is in French

*For any* confirmation email sent, all text content SHALL be in French language.

**Validates: Requirements 2.6**

### Property 10: Successful Delivery Is Logged

*For any* confirmation email sent successfully, a log entry SHALL be created with the candidate ID and timestamp.

**Validates: Requirements 3.1**

### Property 11: Failed Delivery Is Logged with Details

*For any* confirmation email that fails to send, a log entry SHALL be created with error details and the candidate ID.

**Validates: Requirements 3.2**

### Property 12: Log Contains Required Fields

*For any* email delivery log entry, the log SHALL contain email address, subject, and delivery status.

**Validates: Requirements 3.3**

### Property 13: Mail Configuration Is Used

*For any* confirmation email sent, the system SHALL use the Laravel mail configuration from the .env file (MAIL_HOST, MAIL_PORT, MAIL_USERNAME, etc.).

**Validates: Requirements 4.1**

### Property 14: Email Service Uses NotificationService

*For any* enrollment submission, the email service SHALL be called through the NotificationService integration.

**Validates: Requirements 4.2**

### Property 15: Email Sent After Status Update

*For any* enrollment submission, the email SHALL be sent after the enrollment status is updated to 'submitted'.

**Validates: Requirements 4.3**

### Property 16: Template Placeholders Are Substituted

*For any* confirmation email sent, all template placeholders (candidate_name, enrollment_id, submission_date) SHALL be replaced with actual values.

**Validates: Requirements 5.3**

### Property 17: Fallback Template Used When Missing

*For any* enrollment where the configured template is not found, the system SHALL use a default fallback message.

**Validates: Requirements 5.4**

### Property 18: Invalid Email Format Is Validated

*For any* candidate with an invalid email address format, the system SHALL validate the email before attempting to send.

**Validates: Requirements 6.1**

### Property 19: Invalid Email Does Not Throw Exception

*For any* candidate with an invalid email address, the system SHALL log the validation error and skip sending without throwing an exception.

**Validates: Requirements 6.2**

### Property 20: Temporary Failures Are Logged

*For any* email sending attempt that fails due to temporary error, the system SHALL log the error with details.

**Validates: Requirements 6.3**

### Property 21: Service Unavailability Does Not Block Processing

*For any* enrollment submission where the email service is unavailable, the system SHALL log the unavailability and continue with enrollment processing.

**Validates: Requirements 6.5**

## Error Handling

The system implements comprehensive error handling to ensure robustness:

1. **Email Validation Errors**: Invalid email formats are caught before sending, logged, and skipped without exceptions
2. **Template Not Found**: Falls back to default template if configured template is missing
3. **SMTP Connection Failures**: Logged with error details; enrollment submission continues
4. **Temporary Delivery Failures**: Logged for later investigation; enrollment submission continues
5. **Service Unavailability**: Logged; enrollment submission continues
6. **Candidate Not Found**: Checked before sending; logged if missing

All errors are logged with:
- Enrollment ID and candidate ID
- Error message and stack trace
- Timestamp of error
- Email address attempted

## Testing Strategy

### Unit Tests

Unit tests verify specific examples and edge cases:

1. **Email Validation**
   - Valid email formats are accepted
   - Invalid formats (missing @, invalid domain) are rejected
   - Edge cases (very long emails, special characters) are handled

2. **Template Substitution**
   - Placeholders are correctly replaced with actual values
   - Multiple placeholders in same template are all substituted
   - Missing placeholders don't cause errors

3. **Error Handling**
   - Invalid email addresses are logged without exceptions
   - Missing templates fall back to default
   - SMTP failures are caught and logged

4. **Integration**
   - Email service is called through NotificationService
   - Enrollment status is updated before email is sent
   - Email sending doesn't block enrollment submission

### Property-Based Tests

Property-based tests verify universal properties across many generated inputs:

1. **Email Delivery Property** (Property 1)
   - For all valid enrollments, email is sent to candidate email address
   - Minimum 100 iterations with random enrollment data

2. **Email Content Properties** (Properties 2-5, 7-9)
   - For all sent emails, required content is present
   - Test with various candidate names, enrollment IDs, timestamps
   - Verify French language consistency

3. **Error Handling Properties** (Properties 6, 19-21)
   - For all error scenarios, enrollment continues processing
   - For all failures, appropriate logs are created
   - Test with various failure types and conditions

4. **Logging Properties** (Properties 10-12)
   - For all sent emails, delivery is logged with required fields
   - For all failures, error details are logged
   - Verify log completeness and accuracy

5. **Configuration Properties** (Property 13)
   - For all emails, configured SMTP settings are used
   - Verify mail configuration is respected

6. **Integration Properties** (Properties 14-15)
   - For all submissions, email service is called through NotificationService
   - For all submissions, email is sent after status update

**Test Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with: `Feature: enrollment-confirmation-email, Property {number}: {property_text}`
- Use fast-check or similar library for property generation
- Mock external services (SMTP, database) for deterministic testing
