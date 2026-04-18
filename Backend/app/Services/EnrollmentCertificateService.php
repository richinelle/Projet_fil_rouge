<?php

namespace App\Services;

use App\Models\Enrollment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class EnrollmentCertificateService
{
    /**
     * Generate enrollment certificate (fiche d'inscription) as PDF
     */
    public static function generateCertificate(Enrollment $enrollment, string $candidateCode): string
    {
        $data = [
            'enrollment' => $enrollment,
            'candidateCode' => $candidateCode,
            'candidate' => $enrollment->candidate,
            'department' => $enrollment->department,
            'filiere' => $enrollment->filiere,
            'examCenter' => $enrollment->examCenter,
            'depositCenter' => $enrollment->depositCenter,
            'generatedAt' => now()->format('d/m/Y H:i'),
        ];

        $pdf = Pdf::loadView('emails.enrollment-certificate', $data);
        
        // Generate filename
        $filename = 'fiche_inscription_' . $enrollment->id . '_' . $candidateCode . '.pdf';
        $path = 'certificates/' . $filename;

        // Store PDF
        Storage::disk('local')->put($path, $pdf->output());

        return Storage::disk('local')->path($path);
    }

    /**
     * Get certificate path for an enrollment
     */
    public static function getCertificatePath(Enrollment $enrollment): ?string
    {
        if (!$enrollment->candidate_code) {
            return null;
        }

        $filename = 'fiche_inscription_' . $enrollment->id . '_' . $enrollment->candidate_code . '.pdf';
        $path = 'certificates/' . $filename;

        if (Storage::disk('local')->exists($path)) {
            return Storage::disk('local')->path($path);
        }

        return null;
    }

    /**
     * Delete certificate for an enrollment
     */
    public static function deleteCertificate(Enrollment $enrollment): bool
    {
        if (!$enrollment->candidate_code) {
            return false;
        }

        $filename = 'fiche_inscription_' . $enrollment->id . '_' . $enrollment->candidate_code . '.pdf';
        $path = 'certificates/' . $filename;

        if (Storage::disk('local')->exists($path)) {
            Storage::disk('local')->delete($path);
            return true;
        }

        return false;
    }
}
