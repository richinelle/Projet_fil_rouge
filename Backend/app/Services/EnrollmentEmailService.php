<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\EmailDeliveryLog;
use App\Mail\EnrollmentConfirmationMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class EnrollmentEmailService
{
    /**
     * Send confirmation email for enrollment submission
     * 
     * @param Enrollment $enrollment
     * @return bool Success status
     */
    public function sendConfirmationEmail(Enrollment $enrollment): bool
    {
        try {
            // Get candidate email
            $candidateEmail = $enrollment->candidate->email;
            
            // Validate email format
            if (!$this->validateEmailFormat($candidateEmail)) {
                $this->logEmailDelivery($enrollment, 'invalid_email', 'Invalid email format');
                Log::warning("Invalid email format for candidate {$enrollment->candidate_id}: {$candidateEmail}");
                return false;
            }
            
            // Get email template
            $template = $this->getEmailTemplate();
            
            // Substitute placeholders
            $subject = $this->substituteTemplatePlaceholders($template['subject'], $enrollment);
            $body = $this->substituteTemplatePlaceholders($template['body'], $enrollment);
            
            // Send email using Mailable
            Mail::to($candidateEmail)->send(new EnrollmentConfirmationMail($enrollment, $subject, $body));
            
            // Log successful delivery
            $this->logEmailDelivery($enrollment, 'sent', null);
            Log::info("Confirmation email sent successfully to {$candidateEmail} for enrollment {$enrollment->id}");
            
            return true;
        } catch (\Exception $e) {
            // Log failure
            $this->logEmailDelivery($enrollment, 'failed', $e->getMessage());
            Log::error("Failed to send confirmation email for enrollment {$enrollment->id}: {$e->getMessage()}");
            
            return false;
        }
    }
    
    /**
     * Validate email address format
     * 
     * @param string $email
     * @return bool
     */
    private function validateEmailFormat(string $email): bool
    {
        $validator = Validator::make(
            ['email' => $email],
            ['email' => 'required|email']
        );
        
        return !$validator->fails();
    }
    
    /**
     * Get email template with placeholders
     * 
     * @return array Template with subject and body
     */
    private function getEmailTemplate(): array
    {
        // Try to get template from config
        $template = config('email-templates.enrollment_confirmation');
        
        // If not found, use default fallback
        if (!$template) {
            $template = $this->getDefaultTemplate();
        }
        
        return $template;
    }
    
    /**
     * Get default fallback template
     * 
     * @return array
     */
    private function getDefaultTemplate(): array
    {
        return [
            'subject' => 'Confirmation de candidature - Dossier #{enrollment_id}',
            'body' => <<<'HTML'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .content { margin-bottom: 20px; }
        .footer { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-top: 20px; font-size: 12px; }
        .details { background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .details-item { margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Bonjour {candidate_name},</h2>
        </div>
        
        <div class="content">
            <p>Votre candidature a été soumise avec succès et est en cours de traitement. Vous recevrez une réponse d'ici 24h ou veuillez nous contacter.</p>
            
            <div class="details">
                <h3>Détails de votre candidature:</h3>
                <div class="details-item">
                    <strong>Numéro de dossier:</strong> {enrollment_id}
                </div>
                <div class="details-item">
                    <strong>Date de soumission:</strong> {submission_date} à {submission_time}
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Besoin d'aide?</strong></p>
            <p>Si vous avez des questions concernant votre candidature, veuillez nous contacter:</p>
            <p>
                Email: richinellelaurence@gmail.com<br>
                Téléphone: +237 696482594<br>
                Horaires: Lundi - Vendredi, 9h00 - 17h00
            </p>
            <p style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
                Cordialement,<br>
                L'équipe de traitement des candidatures
            </p>
        </div>
    </div>
</body>
</html>
HTML
        ];
    }
    
    /**
     * Replace placeholders in template with actual values
     * 
     * @param string $template
     * @param Enrollment $enrollment
     * @return string
     */
    private function substituteTemplatePlaceholders(string $template, Enrollment $enrollment): string
    {
        $submittedAt = $enrollment->submitted_at ?? now();
        
        $replacements = [
            '{candidate_name}' => $enrollment->full_name ?? $enrollment->candidate->first_name . ' ' . $enrollment->candidate->last_name,
            '{enrollment_id}' => $enrollment->id,
            '{submission_date}' => $submittedAt->format('d/m/Y'),
            '{submission_time}' => $submittedAt->format('H:i'),
        ];
        
        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }
    
    /**
     * Log email delivery event
     * 
     * @param Enrollment $enrollment
     * @param string $status
     * @param string|null $error
     */
    private function logEmailDelivery(Enrollment $enrollment, string $status, ?string $error = null): void
    {
        try {
            EmailDeliveryLog::create([
                'enrollment_id' => $enrollment->id,
                'candidate_id' => $enrollment->candidate_id,
                'email_address' => $enrollment->candidate->email,
                'subject' => 'Confirmation de candidature - Dossier #' . $enrollment->id,
                'status' => $status,
                'error_message' => $error,
                'sent_at' => $status === 'sent' ? now() : null,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to log email delivery for enrollment {$enrollment->id}: {$e->getMessage()}");
        }
    }
}
