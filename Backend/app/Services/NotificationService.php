<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    /**
     * Envoyer une notification au candidat quand sa candidature est approuvée
     */
    public static function notifyCandidateOnEnrollmentApproval(Enrollment $enrollment)
    {
        $candidate = $enrollment->candidate;

        if ($candidate && $candidate->user) {
            Notification::create([
                'user_id' => $candidate->user->id,
                'type' => 'enrollment_approved',
                'title' => 'Candidature approuvée - Code: '.$enrollment->candidate_code,
                'message' => 'Félicitations! Votre candidature a été approuvée. Votre code candidat est: '.$enrollment->candidate_code.'. Consultez votre fiche d\'inscription.',
                'data' => [
                    'enrollment_id' => $enrollment->id,
                    'candidate_id' => $enrollment->candidate_id,
                    'status' => 'approved',
                    'candidate_code' => $enrollment->candidate_code,
                    'action_url' => '/certificate',
                    'action_label' => 'Voir la fiche',
                ],
            ]);
        }
    }

    /**
     * Envoyer une notification au candidat quand sa candidature est rejetée
     */
    public static function notifyCandidateOnEnrollmentRejection(Enrollment $enrollment)
    {
        $candidate = $enrollment->candidate;

        if ($candidate && $candidate->user) {
            Notification::create([
                'user_id' => $candidate->user->id,
                'type' => 'enrollment_rejected',
                'title' => 'Candidature rejetée',
                'message' => 'Votre candidature a été rejetée. Raison: '.$enrollment->rejection_reason,
                'data' => [
                    'enrollment_id' => $enrollment->id,
                    'candidate_id' => $enrollment->candidate_id,
                    'status' => 'rejected',
                    'rejection_reason' => $enrollment->rejection_reason,
                ],
            ]);
        }
    }

    /**
     * Envoyer une notification au candidat quand il soumet son enrollment
     */
    public static function notifyCandidateOnEnrollmentSubmission(Enrollment $enrollment)
    {
        $candidate = $enrollment->candidate;

        if ($candidate && $candidate->user) {
            Notification::create([
                'user_id' => $candidate->user->id,
                'type' => 'enrollment_submitted_candidate',
                'title' => 'Candidature en cours de traitement',
                'message' => 'Votre candidature est en cours de traitement. Veuillez patienter qu\'elle soit approuvée ou rejetée.',
                'data' => [
                    'enrollment_id' => $enrollment->id,
                    'candidate_id' => $enrollment->candidate_id,
                    'status' => 'processing',
                ],
            ]);
        }
    }

    /**
     * Envoyer une notification à l'admin quand un candidat soumet son enrollment
     */
    public static function notifyAdminOnEnrollmentSubmission(Enrollment $enrollment)
    {
        // Récupérer tous les admins
        $admins = User::where('role', 'admin')->get();

        // Récupérer les documents de l'enrollment
        $documents = $enrollment->documents()->get()->map(function ($doc) {
            return [
                'id' => $doc->id,
                'type' => $doc->document_type,
                'filename' => $doc->filename,
                'path' => $doc->file_path,
            ];
        })->toArray();

        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'enrollment_submitted_admin',
                'title' => 'Nouvelle candidature à vérifier',
                'message' => "Le candidat {$enrollment->full_name} a soumis sa candidature. Veuillez vérifier les documents et valider ou rejeter la candidature.",
                'data' => [
                    'enrollment_id' => $enrollment->id,
                    'candidate_id' => $enrollment->candidate_id,
                    'candidate_name' => $enrollment->full_name,
                    'candidate_email' => $enrollment->candidate->email,
                    'candidate_phone' => $enrollment->candidate->phone,
                    'department_name' => $enrollment->department ? $enrollment->department->name : null,
                    'filiere_name' => $enrollment->filiere ? $enrollment->filiere->name : null,
                    'documents' => $documents,
                    'action' => 'review_required',
                ],
            ]);
        }
    }

    /**
     * Envoyer une notification au responsable du département quand un candidat soumet son enrollment
     */
    public static function notifyDepartmentHeadOnEnrollmentSubmission(Enrollment $enrollment)
    {
        // Récupérer le responsable du département
        if ($enrollment->department && $enrollment->department->head) {
            $head = $enrollment->department->head;

            Notification::create([
                'user_id' => $head->id,
                'type' => 'enrollment_submitted',
                'title' => 'Nouvelle inscription soumise',
                'message' => "Le candidat {$enrollment->full_name} a soumis son inscription pour le département {$enrollment->department->name}.",
                'data' => [
                    'enrollment_id' => $enrollment->id,
                    'candidate_id' => $enrollment->candidate_id,
                    'candidate_name' => $enrollment->full_name,
                    'department_id' => $enrollment->department_id,
                    'department_name' => $enrollment->department->name,
                    'action' => 'submitted',
                ],
            ]);
        }
    }

    /**
     * Envoyer une notification au responsable quand un candidat crée/modifie son enrollment
     */
    public static function notifyDepartmentHeadOnEnrollmentUpdate(Enrollment $enrollment)
    {
        if ($enrollment->department && $enrollment->department->head) {
            $head = $enrollment->department->head;

            Notification::create([
                'user_id' => $head->id,
                'type' => 'enrollment_updated',
                'title' => 'Inscription modifiée',
                'message' => "Le candidat {$enrollment->full_name} a modifié son inscription pour le département {$enrollment->department->name}.",
                'data' => [
                    'enrollment_id' => $enrollment->id,
                    'candidate_id' => $enrollment->candidate_id,
                    'candidate_name' => $enrollment->full_name,
                    'department_id' => $enrollment->department_id,
                    'department_name' => $enrollment->department->name,
                    'action' => 'updated',
                ],
            ]);
        }
    }

    /**
     * Envoyer une notification au responsable quand un candidat supprime son enrollment
     */
    public static function notifyDepartmentHeadOnEnrollmentDelete(Enrollment $enrollment)
    {
        if ($enrollment->department && $enrollment->department->head) {
            $head = $enrollment->department->head;

            Notification::create([
                'user_id' => $head->id,
                'type' => 'enrollment_deleted',
                'title' => 'Inscription supprimée',
                'message' => "Le candidat {$enrollment->full_name} a supprimé son inscription pour le département {$enrollment->department->name}.",
                'data' => [
                    'enrollment_id' => $enrollment->id,
                    'candidate_id' => $enrollment->candidate_id,
                    'candidate_name' => $enrollment->full_name,
                    'department_id' => $enrollment->department_id,
                    'department_name' => $enrollment->department->name,
                    'action' => 'deleted',
                ],
            ]);
        }
    }

    /**
     * Récupérer les notifications non lues d'un utilisateur
     */
    public static function getUnreadNotifications($userId)
    {
        return Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Récupérer toutes les notifications d'un utilisateur
     */
    public static function getAllNotifications($userId, $limit = 20)
    {
        return Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Marquer une notification comme lue
     */
    public static function markAsRead($notificationId)
    {
        $notification = Notification::find($notificationId);
        if ($notification) {
            $notification->markAsRead();
        }

        return $notification;
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    public static function markAllAsRead($userId)
    {
        Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    /**
     * Compter les notifications non lues
     */
    public static function countUnreadNotifications($userId)
    {
        return Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->count();
    }

    /**
     * Send enrollment confirmation email
     *
     * @return bool Success status
     */
    public static function sendEnrollmentConfirmationEmail(Enrollment $enrollment): bool
    {
        try {
            $emailService = new EnrollmentEmailService;

            return $emailService->sendConfirmationEmail($enrollment);
        } catch (\Exception $e) {
            Log::error("Failed to send enrollment confirmation email: {$e->getMessage()}");

            return false;
        }
    }

    /**
     * Send enrollment rejection email
     *
     * @return bool Success status
     */
    public static function sendEnrollmentRejectionEmail(Enrollment $enrollment): bool
    {
        try {
            $candidate = $enrollment->candidate;
            if (! $candidate || ! $candidate->email) {
                Log::warning("Cannot send rejection email: candidate or email missing for enrollment {$enrollment->id}");

                return false;
            }

            // Get email template
            $template = config('email-templates.enrollment_rejection');
            if (! $template) {
                $template = self::getDefaultRejectionTemplate();
            }

            // Substitute placeholders
            $subject = str_replace(
                ['{enrollment_id}'],
                [$enrollment->id],
                $template['subject']
            );

            $body = str_replace(
                ['{candidate_name}', '{enrollment_id}', '{rejection_reason}'],
                [$enrollment->full_name ?? $candidate->first_name.' '.$candidate->last_name, $enrollment->id, $enrollment->rejection_reason ?? 'Non spécifiée'],
                $template['body']
            );

            // Send email
            Mail::raw($body, function ($mail) use ($candidate, $subject) {
                $mail->to($candidate->email)
                    ->subject($subject)
                    ->html($body);
            });

            Log::info("Rejection email sent successfully to {$candidate->email} for enrollment {$enrollment->id}");

            return true;
        } catch (\Exception $e) {
            Log::error("Failed to send enrollment rejection email: {$e->getMessage()}", [
                'enrollment_id' => $enrollment->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return false;
        }
    }

    /**
     * Get default rejection email template
     */
    private static function getDefaultRejectionTemplate(): array
    {
        return [
            'subject' => 'Candidature Rejetée - Dossier #{enrollment_id}',
            'body' => <<<'HTML'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #e74c3c; }
        .content { margin-bottom: 20px; }
        .footer { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-top: 20px; font-size: 12px; }
        .details { background-color: #ffe6e6; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .details-item { margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Bonjour {candidate_name},</h2>
        </div>
        
        <div class="content">
            <p>Nous regrettons de vous informer que votre candidature a été rejetée après examen attentif de votre dossier.</p>
            
            <div class="details">
                <h3>Détails du rejet:</h3>
                <div class="details-item">
                    <strong>Numéro de dossier:</strong> {enrollment_id}
                </div>
                <div class="details-item">
                    <strong>Raison du rejet:</strong> {rejection_reason}
                </div>
            </div>
            
            <p>Si vous avez des questions concernant cette décision ou si vous souhaitez contester le rejet, n'hésitez pas à nous contacter.</p>
        </div>
        
        <div class="footer">
            <p><strong>Besoin d'aide?</strong></p>
            <p>
                Email: richinellelaurence@gmail.com<br>
                Téléphone: +237 696482594<br>
                Horaires: Lundi - Vendredi, 9h00 - 17h00
            </p>
            <p style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
                Cordialement,<br>
                L'équipe d'administration
            </p>
        </div>
    </div>
</body>
</html>
HTML
        ];
    }

    /**
     * Send enrollment approval email with candidate code and certificate
     *
     * @return bool Success status
     */
    public static function sendEnrollmentApprovalEmail(Enrollment $enrollment, string $candidateCode): bool
    {
        try {
            $candidate = $enrollment->candidate;
            if (! $candidate || ! $candidate->email) {
                Log::warning("Cannot send approval email: candidate or email missing for enrollment {$enrollment->id}");

                return false;
            }

            $subject = 'Candidature Approuvée - Code Candidat: '.$candidateCode;
            $message = "Félicitations!\n\n";
            $message .= "Votre candidature a été approuvée.\n\n";
            $message .= 'Votre code candidat: '.$candidateCode."\n\n";
            $message .= "Veuillez conserver ce code pour vos démarches futures.\n\n";
            $message .= "Vous pouvez télécharger votre fiche d'inscription depuis votre tableau de bord.\n\n";
            $message .= "Cordialement,\nL'équipe d'administration";

            // Try to generate and attach certificate, but don't fail if it doesn't work
            $certificatePath = null;
            try {
                $certificatePath = EnrollmentCertificateService::generateCertificate($enrollment, $candidateCode);
                if (! $certificatePath || ! file_exists($certificatePath)) {
                    $certificatePath = null;
                }
            } catch (\Exception $pdfError) {
                Log::warning("Could not generate certificate for email: {$pdfError->getMessage()}");
            }

            // Send email with or without attachment
            Mail::raw($message, function ($mail) use ($candidate, $subject, $certificatePath) {
                $mail->to($candidate->email)->subject($subject);

                if ($certificatePath && file_exists($certificatePath)) {
                    $mail->attach($certificatePath, [
                        'as' => 'fiche_inscription_'.basename($certificatePath),
                        'mime' => 'application/pdf',
                    ]);
                }
            });

            return true;
        } catch (\Exception $e) {
            Log::error("Failed to send enrollment approval email: {$e->getMessage()}", [
                'enrollment_id' => $enrollment->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return false;
        }
    }
}
