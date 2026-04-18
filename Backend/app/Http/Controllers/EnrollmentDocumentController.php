<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\EnrollmentDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EnrollmentDocumentController extends Controller
{
    public function uploadDocument(Request $request)
    {
        $candidateId = auth('api')->id();

        \Log::info('[EnrollmentDocumentController] Upload attempt', [
            'candidateId' => $candidateId,
            'authUser' => auth('api')->user(),
            'documentType' => $request->input('document_type'),
            'hasFile' => $request->hasFile('file'),
            'authHeader' => $request->header('Authorization'),
        ]);

        $validated = $request->validate([
            'document_type' => 'required|in:bac_transcript,birth_certificate,valid_cni,photo_4x4_1,photo_4x4_2,photo_4x4_3,photo_4x4_4,payment_receipt',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'contest_id' => 'nullable|exists:contests,id',
        ]);

        $enrollment = Enrollment::where('candidate_id', $candidateId)->first();

        if (! $enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        // Vérifier que le reçu de paiement a un concours associé
        if ($validated['document_type'] === 'payment_receipt' && ! $validated['contest_id']) {
            return response()->json(['message' => 'Contest ID is required for payment receipt'], 400);
        }

        // Vérifier que le reçu de paiement contient un QR code
        if ($validated['document_type'] === 'payment_receipt') {
            $file = $request->file('file');
            if (! $this->hasQrCode($file)) {
                return response()->json([
                    'message' => 'Le reçu de paiement doit contenir un code QR valide. Veuillez télécharger un reçu de paiement avec un code QR visible.',
                    'error_code' => 'INVALID_QR_CODE',
                ], 400);
            }
        }

        // Delete existing document of same type
        $query = EnrollmentDocument::where('enrollment_id', $enrollment->id)
            ->where('document_type', $validated['document_type']);

        if ($validated['document_type'] === 'payment_receipt' && $validated['contest_id']) {
            $query->where('contest_id', $validated['contest_id']);
        }

        $existingDoc = $query->first();

        if ($existingDoc) {
            Storage::disk('local')->delete($existingDoc->file_path);
            $existingDoc->delete();
        }

        $file = $request->file('file');
        $path = $file->store("enrollments/{$enrollment->id}", 'local');

        $document = EnrollmentDocument::create([
            'enrollment_id' => $enrollment->id,
            'document_type' => $validated['document_type'],
            'contest_id' => $validated['contest_id'] ?? null,
            'file_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);

        return response()->json([
            'message' => 'Document uploaded successfully',
            'document' => $document,
        ], 201);
    }

    public function getEnrollmentDocuments()
    {
        $candidateId = auth('api')->id();

        $enrollment = Enrollment::where('candidate_id', $candidateId)->first();

        if (! $enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        $documents = $enrollment->documents()->get()->map(function ($doc) {
            return [
                'id' => $doc->id,
                'document_type' => $doc->document_type,
                'filename' => $doc->filename,
                'original_filename' => $doc->original_filename,
                'file_path' => $doc->file_path,
                'file_size' => $doc->file_size,
                'mime_type' => $doc->mime_type,
                'created_at' => $doc->created_at,
            ];
        });

        return response()->json([
            'documents' => $documents,
        ]);
    }

    public function deleteDocument($documentId)
    {
        $candidateId = auth('api')->id();

        $document = EnrollmentDocument::find($documentId);

        if (! $document) {
            return response()->json(['message' => 'Document not found'], 404);
        }

        $enrollment = $document->enrollment;

        if ($enrollment->candidate_id !== $candidateId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        Storage::disk('local')->delete($document->file_path);
        $document->delete();

        return response()->json([
            'message' => 'Document deleted successfully',
        ]);
    }

    public function downloadDocument($documentId)
    {
        $candidateId = auth('api')->id();

        $document = EnrollmentDocument::find($documentId);

        if (! $document) {
            return response()->json(['message' => 'Document not found'], 404);
        }

        $enrollment = $document->enrollment;

        if ($enrollment->candidate_id !== $candidateId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return Storage::disk('local')->download($document->file_path, $document->original_filename);
    }

    public function viewDocument($documentId)
    {
        $candidateId = auth('api')->id();

        $document = EnrollmentDocument::find($documentId);

        if (! $document) {
            return response()->json(['message' => 'Document not found'], 404);
        }

        $enrollment = $document->enrollment;

        if ($enrollment->candidate_id !== $candidateId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Vérifier que le fichier existe
        if (! Storage::disk('local')->exists($document->file_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        // Retourner le fichier avec le bon type MIME
        return response()->file(
            Storage::disk('local')->path($document->file_path),
            ['Content-Type' => $document->mime_type]
        );
    }

    public function viewDocumentAdmin($documentId)
    {
        $document = EnrollmentDocument::find($documentId);

        if (! $document) {
            return response()->json(['message' => 'Document not found'], 404);
        }

        // Vérifier que le fichier existe
        if (! Storage::disk('local')->exists($document->file_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        // Retourner le fichier avec le bon type MIME
        return response()->file(
            Storage::disk('local')->path($document->file_path),
            ['Content-Type' => $document->mime_type]
        );
    }

    private function hasQrCode($file)
    {
        try {
            $filePath = $file->getRealPath();
            $mimeType = $file->getMimeType();

            // Pour les fichiers PDF, on accepte comme valides
            if ($mimeType === 'application/pdf') {
                return true;
            }

            // Pour les images, on utilise une détection basée sur les patterns
            if (in_array($mimeType, ['image/jpeg', 'image/png'])) {
                // Charger l'image
                if ($mimeType === 'image/jpeg') {
                    $image = imagecreatefromjpeg($filePath);
                } else {
                    $image = imagecreatefrompng($filePath);
                }

                if (! $image) {
                    return false;
                }

                $width = imagesx($image);
                $height = imagesy($image);

                // Vérifier les dimensions minimales
                if ($width < 100 || $height < 100) {
                    imagedestroy($image);

                    return false;
                }

                // Analyser les pixels pour détecter les patterns de QR code
                // Les QR codes ont des carrés noirs et blancs distinctifs
                $hasQrPattern = $this->detectQrPattern($image, $width, $height);

                imagedestroy($image);

                return $hasQrPattern;
            }

            return false;
        } catch (\Exception $e) {
            \Log::error('QR Code detection error: '.$e->getMessage());

            return false;
        }
    }

    private function detectQrPattern($image, $width, $height)
    {
        // Vérifier les coins du QR code (carrés de positionnement)
        // Les QR codes ont des carrés noirs dans les trois coins

        $sampleSize = min($width, $height) / 7; // Environ 1/7 de la taille
        $threshold = 128; // Seuil pour noir/blanc

        // Vérifier le coin supérieur gauche
        $topLeftBlack = $this->isAreaDark($image, 0, 0, $sampleSize, $threshold);

        // Vérifier le coin supérieur droit
        $topRightBlack = $this->isAreaDark($image, $width - $sampleSize, 0, $sampleSize, $threshold);

        // Vérifier le coin inférieur gauche
        $bottomLeftBlack = $this->isAreaDark($image, 0, $height - $sampleSize, $sampleSize, $threshold);

        // Un QR code valide doit avoir au moins 2 des 3 carrés de positionnement
        $cornerCount = ($topLeftBlack ? 1 : 0) + ($topRightBlack ? 1 : 0) + ($bottomLeftBlack ? 1 : 0);

        return $cornerCount >= 2;
    }

    private function isAreaDark($image, $x, $y, $size, $threshold)
    {
        $darkPixels = 0;
        $totalPixels = 0;

        // Échantillonner la zone
        $step = max(1, (int) ($size / 10)); // Échantillonner tous les 10 pixels

        for ($i = $x; $i < $x + $size; $i += $step) {
            for ($j = $y; $j < $y + $size; $j += $step) {
                if ($i >= 0 && $i < imagesx($image) && $j >= 0 && $j < imagesy($image)) {
                    $rgb = imagecolorat($image, $i, $j);
                    $r = ($rgb >> 16) & 0xFF;
                    $g = ($rgb >> 8) & 0xFF;
                    $b = $rgb & 0xFF;

                    // Calculer la luminosité
                    $brightness = (0.299 * $r + 0.587 * $g + 0.114 * $b);

                    if ($brightness < $threshold) {
                        $darkPixels++;
                    }
                    $totalPixels++;
                }
            }
        }

        // Si plus de 60% des pixels sont sombres, c'est une zone sombre
        return $totalPixels > 0 && ($darkPixels / $totalPixels) > 0.6;
    }
}
