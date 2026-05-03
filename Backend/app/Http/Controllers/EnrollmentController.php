<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\Candidate;
use App\Models\Payment;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function getEnrollmentStatus($candidateId = null)
    {
        // Si pas d'ID fourni, utiliser l'ID du candidat authentifié
        if (!$candidateId) {
            $candidateId = auth('api')->id();
        }

        $candidate = Candidate::find($candidateId);
        
        if (!$candidate) {
            return response()->json(['message' => 'Candidate not found'], 404);
        }

        $enrollment = $candidate->enrollment;

        // Si pas d'enrollment, en créer un avec les valeurs par défaut
        if (!$enrollment) {
            $enrollment = Enrollment::create([
                'candidate_id' => $candidateId,
                'full_name' => $candidate->first_name . ' ' . $candidate->last_name,
                'date_of_birth' => '1990-01-01',
                'gender' => 'male',
                'nationality' => '',
                'id_number' => 'TEMP-' . $candidateId . '-' . time(),
                'id_type' => 'passport',
                'address' => '',
                'city' => '',
                'country' => '',
                'postal_code' => '',
                'education_level' => '',
                'emergency_contact_name' => '',
                'emergency_contact_phone' => '',
                'emergency_contact_relationship' => '',
                'status' => 'incomplete',
            ]);
        }

        $hasCertificate = $enrollment->status === 'approved' && $enrollment->candidate_code;

        return response()->json([
            'status' => $enrollment->status,
            'enrollment' => $enrollment,
            'candidate_code' => $enrollment->candidate_code,
            'has_certificate' => $hasCertificate,
            'steps' => $this->getEnrollmentSteps(),
            'progress' => $this->calculateProgress($enrollment),
        ]);
    }

    public function createOrUpdateEnrollment(Request $request)
    {
        $candidateId = auth('api')->id();
        
        // Validation flexible - tous les champs sont optionnels pour la sauvegarde partielle
        $validated = $request->validate([
            'full_name' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'nationality' => 'nullable|string',
            'cni_number' => 'nullable|string',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'country' => 'nullable|string',
            'postal_code' => 'nullable|string',
            'education_level' => 'nullable|in:high_school,bachelor,master,phd',
            'school_name' => 'nullable|string',
            'field_of_study' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string',
            'emergency_contact_phone' => 'nullable|string',
            'emergency_contact_relationship' => 'nullable|string',
            'department_id' => 'nullable|exists:departments,id',
            'filiere_id' => 'nullable|exists:filieres,id',
            'exam_center_id' => 'nullable|exists:exam_centers,id',
            'deposit_center_id' => 'nullable|exists:deposit_centers,id',
        ]);

        // Récupérer ou créer l'enrollment
        $enrollment = Enrollment::firstOrCreate(
            ['candidate_id' => $candidateId],
            [
                'full_name' => '',
                'date_of_birth' => '1990-01-01',
                'gender' => 'male',
                'nationality' => '',
                'cni_number' => '',
                'address' => '',
                'city' => '',
                'country' => '',
                'postal_code' => '',
                'education_level' => '',
                'school_name' => '',
                'field_of_study' => '',
                'emergency_contact_name' => '',
                'emergency_contact_phone' => '',
                'emergency_contact_relationship' => '',
                'status' => 'incomplete',
            ]
        );

        // Mettre à jour uniquement les champs fournis (non-null)
        $updateData = array_filter($validated, function ($value) {
            return $value !== null;
        });

        if (!empty($updateData)) {
            $enrollment->update($updateData);
        }

        return response()->json([
            'message' => 'Enrollment saved successfully',
            'enrollment' => $enrollment,
        ]);
    }

    public function submitEnrollment(Request $request)
    {
        $candidateId = auth('api')->id();
        
        $enrollment = Enrollment::where('candidate_id', $candidateId)->first();

        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        if ($enrollment->status === 'submitted') {
            return response()->json(['message' => 'Enrollment already submitted'], 400);
        }

        // Vérifier que tous les champs requis sont remplis
        $requiredFields = [
            'full_name', 'date_of_birth', 'gender', 'nationality', 'city', 'country',
            'cni_number', 'address', 'postal_code',
            'education_level', 'school_name', 'field_of_study',
            'department_id', 'filiere_id', 'exam_center_id', 'deposit_center_id',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
        ];

        $missingFields = [];
        foreach ($requiredFields as $field) {
            $value = $enrollment->$field;
            // Considérer comme manquant si: null, chaîne vide, 0, ou false
            if (empty($value) && $value !== '0' && $value !== 0) {
                $missingFields[] = $field;
            }
        }

        if (!empty($missingFields)) {
            return response()->json([
                'message' => 'All fields are required to submit enrollment',
                'missing_fields' => $missingFields,
                'enrollment_data' => [
                    'full_name' => $enrollment->full_name,
                    'date_of_birth' => $enrollment->date_of_birth,
                    'gender' => $enrollment->gender,
                    'nationality' => $enrollment->nationality,
                    'city' => $enrollment->city,
                    'country' => $enrollment->country,
                    'cni_number' => $enrollment->cni_number,
                    'address' => $enrollment->address,
                    'postal_code' => $enrollment->postal_code,
                    'education_level' => $enrollment->education_level,
                    'school_name' => $enrollment->school_name,
                    'field_of_study' => $enrollment->field_of_study,
                    'department_id' => $enrollment->department_id,
                    'filiere_id' => $enrollment->filiere_id,
                    'exam_center_id' => $enrollment->exam_center_id,
                    'deposit_center_id' => $enrollment->deposit_center_id,
                    'emergency_contact_name' => $enrollment->emergency_contact_name,
                    'emergency_contact_phone' => $enrollment->emergency_contact_phone,
                    'emergency_contact_relationship' => $enrollment->emergency_contact_relationship,
                ],
            ], 400);
        }

        // Check if all required documents are uploaded
        $requiredDocuments = ['bac_transcript', 'birth_certificate', 'valid_cni', 'photo_4x4_1', 'photo_4x4_2', 'photo_4x4_3', 'photo_4x4_4', 'payment_receipt'];
        $uploadedDocuments = $enrollment->documents()->pluck('document_type')->toArray();

        $missingDocuments = array_diff($requiredDocuments, $uploadedDocuments);

        if (!empty($missingDocuments)) {
            return response()->json([
                'message' => 'Missing required documents',
                'missing_documents' => $missingDocuments,
            ], 400);
        }

        // Vérifier qu'il y a au moins un reçu de paiement avec un concours
        $paymentReceipt = $enrollment->documents()
            ->where('document_type', 'payment_receipt')
            ->whereNotNull('contest_id')
            ->first();

        if (!$paymentReceipt) {
            return response()->json([
                'message' => 'Payment receipt with contest is required',
            ], 400);
        }

        // Vérifier qu'il y a un paiement complété pour le concours du reçu
        $completedPayment = Payment::where('candidate_id', $candidateId)
            ->where('contest_id', $paymentReceipt->contest_id)
            ->where('status', 'completed')
            ->first();

        if (!$completedPayment) {
            return response()->json([
                'message' => 'Payment must be completed for the selected contest before submission',
            ], 400);
        }

        $enrollment->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        // Envoyer la notification au candidat
        NotificationService::notifyCandidateOnEnrollmentSubmission($enrollment);

        // Envoyer la notification à l'admin
        NotificationService::notifyAdminOnEnrollmentSubmission($enrollment);

        // Envoyer la notification au responsable du département
        NotificationService::notifyDepartmentHeadOnEnrollmentSubmission($enrollment);

        // Send confirmation email (wrapped in try-catch to prevent blocking enrollment)
        try {
            NotificationService::sendEnrollmentConfirmationEmail($enrollment);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to send enrollment confirmation email: {$e->getMessage()}");
            // Don't block enrollment submission if email fails
        }

        return response()->json([
            'message' => 'Enrollment submitted successfully',
            'enrollment' => $enrollment,
        ]);
    }

    public function deleteEnrollment(Request $request)
    {
        $candidateId = auth('api')->id();
        
        $enrollment = Enrollment::where('candidate_id', $candidateId)->first();

        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        // Envoyer la notification au responsable avant la suppression
        NotificationService::notifyDepartmentHeadOnEnrollmentDelete($enrollment);

        $enrollment->delete();

        return response()->json([
            'message' => 'Enrollment deleted successfully',
        ]);
    }

    public function getEnrollmentForm($candidateId = null)
    {
        // Si pas d'ID fourni, utiliser l'ID du candidat authentifié
        if (!$candidateId) {
            $candidateId = auth('api')->id();
        }

        $candidate = Candidate::find($candidateId);
        
        if (!$candidate) {
            return response()->json(['message' => 'Candidate not found'], 404);
        }

        $enrollment = $candidate->enrollment;

        return response()->json([
            'candidate' => $candidate,
            'enrollment' => $enrollment,
            'form_fields' => $this->getFormFields(),
        ]);
    }

    private function getEnrollmentSteps()
    {
        return [
            [
                'id' => 1,
                'title' => 'Informations personnelles',
                'description' => 'Remplissez vos informations de base',
                'fields' => ['full_name', 'date_of_birth', 'gender', 'nationality', 'city', 'country'],
            ],
            [
                'id' => 2,
                'title' => 'Identification',
                'description' => 'Fournissez votre numéro CNI',
                'fields' => ['cni_number'],
            ],
            [
                'id' => 3,
                'title' => 'Adresse',
                'description' => 'Entrez votre adresse complète',
                'fields' => ['address', 'postal_code'],
            ],
            [
                'id' => 4,
                'title' => 'Éducation',
                'description' => 'Informations sur votre formation',
                'fields' => ['education_level', 'school_name', 'field_of_study', 'department_id', 'filiere_id'],
            ],
            [
                'id' => 5,
                'title' => 'Centres',
                'description' => 'Sélectionnez vos centres d\'examen et de dépôt',
                'fields' => ['exam_center_id', 'deposit_center_id'],
            ],
            [
                'id' => 6,
                'title' => 'Contact d\'urgence',
                'description' => 'Informations de contact d\'urgence',
                'fields' => ['emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'],
            ],
        ];
    }

    private function getFormFields()
    {
        return [
            'full_name' => ['type' => 'text', 'label' => 'Nom complet', 'required' => true],
            'date_of_birth' => ['type' => 'date', 'label' => 'Date de naissance', 'required' => true],
            'gender' => ['type' => 'select', 'label' => 'Genre', 'options' => ['male' => 'Homme', 'female' => 'Femme', 'other' => 'Autre'], 'required' => true],
            'nationality' => ['type' => 'text', 'label' => 'Nationalité', 'required' => true],
            'city' => ['type' => 'text', 'label' => 'Ville', 'required' => true],
            'country' => ['type' => 'text', 'label' => 'Pays', 'required' => true],
            'cni_number' => ['type' => 'text', 'label' => 'Numéro CNI', 'required' => true],
            'address' => ['type' => 'textarea', 'label' => 'Adresse', 'required' => true],
            'postal_code' => ['type' => 'text', 'label' => 'Code postal', 'required' => true],
            'education_level' => ['type' => 'select', 'label' => 'Niveau d\'études', 'options' => ['high_school' => 'Lycée', 'bachelor' => 'Licence', 'master' => 'Master', 'phd' => 'Doctorat'], 'required' => true],
            'school_name' => ['type' => 'text', 'label' => 'Nom de l\'école/université', 'required' => true],
            'field_of_study' => ['type' => 'text', 'label' => 'Domaine d\'études', 'required' => true],
            'department_id' => ['type' => 'select', 'label' => 'Département', 'required' => true],
            'filiere_id' => ['type' => 'select', 'label' => 'Filière', 'required' => true],
            'exam_center_id' => ['type' => 'select', 'label' => 'Centre d\'examen', 'required' => true],
            'deposit_center_id' => ['type' => 'select', 'label' => 'Centre de dépôt', 'required' => true],
            'emergency_contact_name' => ['type' => 'text', 'label' => 'Nom du contact d\'urgence', 'required' => true],
            'emergency_contact_phone' => ['type' => 'tel', 'label' => 'Téléphone du contact d\'urgence', 'required' => true],
            'emergency_contact_relationship' => ['type' => 'text', 'label' => 'Relation avec le contact d\'urgence', 'required' => true],
        ];
    }

    private function calculateProgress($enrollment)
    {
        // Tous les champs sont maintenant obligatoires
        $requiredFields = [
            'full_name', 'date_of_birth', 'gender', 'nationality', 'city', 'country',
            'cni_number', 'address', 'postal_code',
            'education_level', 'school_name', 'field_of_study',
            'department_id', 'filiere_id', 'exam_center_id', 'deposit_center_id',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
        ];

        $completed = 0;
        foreach ($requiredFields as $field) {
            if ($enrollment->$field) {
                $completed++;
            }
        }

        return round(($completed / count($requiredFields)) * 100);
    }

    public function getAllSubmittedEnrollments(Request $request)
    {
        try {
            // Get pagination parameters from request
            $perPage = $request->query('per_page', 15); // Default 15 items per page
            $page = $request->query('page', 1);
            $status = $request->query('status'); // Optional filter by status
            $search = $request->query('search'); // Optional search by name or email

            // Validate pagination parameters
            $perPage = min((int)$perPage, 100); // Max 100 items per page
            $perPage = max((int)$perPage, 1); // Min 1 item per page
            $page = max((int)$page, 1); // Min page 1

            // Build query
            $query = Enrollment::with(['candidate', 'department', 'filiere']);

            // Apply status filter if provided
            if ($status) {
                $query->where('status', $status);
            }

            // Apply search filter if provided
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                      ->orWhere('cni_number', 'like', "%{$search}%")
                      ->orWhereHas('candidate', function ($q) use ($search) {
                          $q->where('email', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%")
                            ->orWhere('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                      });
                });
            }

            // Get total count before pagination
            $total = $query->count();

            // Apply ordering and pagination
            $enrollments = $query->orderBy('updated_at', 'desc')
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();

            if ($enrollments->isEmpty()) {
                return response()->json([
                    'enrollments' => [],
                    'pagination' => [
                        'total' => 0,
                        'per_page' => $perPage,
                        'current_page' => $page,
                        'last_page' => 0,
                        'from' => 0,
                        'to' => 0,
                    ],
                ]);
            }

            $mapped = $enrollments->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'candidate_id' => $enrollment->candidate_id,
                    'candidate_name' => $enrollment->candidate ? ($enrollment->candidate->first_name . ' ' . $enrollment->candidate->last_name) : 'N/A',
                    'candidate_email' => $enrollment->candidate ? $enrollment->candidate->email : 'N/A',
                    'candidate_phone' => $enrollment->candidate ? $enrollment->candidate->phone : 'N/A',
                    'full_name' => $enrollment->full_name,
                    'date_of_birth' => $enrollment->date_of_birth,
                    'gender' => $enrollment->gender,
                    'nationality' => $enrollment->nationality,
                    'city' => $enrollment->city,
                    'country' => $enrollment->country,
                    'cni_number' => $enrollment->cni_number,
                    'address' => $enrollment->address,
                    'postal_code' => $enrollment->postal_code,
                    'education_level' => $enrollment->education_level,
                    'school_name' => $enrollment->school_name,
                    'field_of_study' => $enrollment->field_of_study,
                    'department_id' => $enrollment->department_id,
                    'department_name' => $enrollment->department ? $enrollment->department->name : null,
                    'filiere_id' => $enrollment->filiere_id,
                    'filiere_name' => $enrollment->filiere ? $enrollment->filiere->name : null,
                    'exam_center_id' => $enrollment->exam_center_id,
                    'deposit_center_id' => $enrollment->deposit_center_id,
                    'emergency_contact_name' => $enrollment->emergency_contact_name,
                    'emergency_contact_phone' => $enrollment->emergency_contact_phone,
                    'emergency_contact_relationship' => $enrollment->emergency_contact_relationship,
                    'status' => $enrollment->status,
                    'submitted_at' => $enrollment->updated_at,
                ];
            });

            // Calculate pagination metadata
            $lastPage = ceil($total / $perPage);
            $from = ($page - 1) * $perPage + 1;
            $to = min($page * $perPage, $total);

            return response()->json([
                'enrollments' => $mapped,
                'pagination' => [
                    'total' => $total,
                    'per_page' => $perPage,
                    'current_page' => $page,
                    'last_page' => $lastPage,
                    'from' => $total > 0 ? $from : 0,
                    'to' => $total > 0 ? $to : 0,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in getAllSubmittedEnrollments: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching enrollments',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getEnrollmentDocuments($enrollmentId)
    {
        $enrollment = Enrollment::find($enrollmentId);

        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        $documents = $enrollment->documents()->get()->map(function ($doc) {
            return [
                'id' => $doc->id,
                'document_type' => $doc->document_type,
                'filename' => $doc->filename,
                'file_path' => $doc->file_path,
                'uploaded_at' => $doc->created_at,
            ];
        });

        return response()->json([
            'documents' => $documents,
            'total' => $documents->count(),
        ]);
    }

    public function approveEnrollment($enrollmentId)
    {
        try {
            \Illuminate\Support\Facades\Log::info("Starting approval for enrollment: {$enrollmentId}");
            
            $enrollment = Enrollment::find($enrollmentId);

            if (!$enrollment) {
                \Illuminate\Support\Facades\Log::warning("Enrollment not found: {$enrollmentId}");
                return response()->json(['message' => 'Enrollment not found'], 404);
            }

            \Illuminate\Support\Facades\Log::info("Enrollment found. Current status: {$enrollment->status}");

            if ($enrollment->status !== 'submitted') {
                \Illuminate\Support\Facades\Log::warning("Cannot approve enrollment {$enrollmentId}. Status is '{$enrollment->status}', expected 'submitted'");
                return response()->json([
                    'message' => 'Only submitted enrollments can be approved',
                    'current_status' => $enrollment->status,
                ], 400);
            }

            // Générer un code candidat unique
            $candidateCode = 'GS' . str_pad($enrollmentId, 4, '0', STR_PAD_LEFT);
            \Illuminate\Support\Facades\Log::info("Generated candidate code: {$candidateCode}");

            $enrollment->update([
                'status' => 'approved',
                'approved_at' => now(),
                'candidate_code' => $candidateCode,
            ]);

            \Illuminate\Support\Facades\Log::info("Enrollment {$enrollmentId} updated to approved status");

            // Envoyer une notification au candidat (non-bloquant)
            try {
                NotificationService::notifyCandidateOnEnrollmentApproval($enrollment);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to send approval notification: {$e->getMessage()}");
            }

            // Envoyer un email avec la fiche d'inscription (non-bloquant)
            $emailSent = false;
            try {
                $emailSent = NotificationService::sendEnrollmentApprovalEmail($enrollment, $candidateCode);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to send approval email: {$e->getMessage()}");
            }

            \Illuminate\Support\Facades\Log::info("Approval completed for enrollment {$enrollmentId}. Email sent: " . ($emailSent ? 'yes' : 'no'));

            return response()->json([
                'message' => 'Enrollment approved successfully',
                'enrollment' => $enrollment,
                'candidate_code' => $candidateCode,
                'email_sent' => $emailSent,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Error in approveEnrollment: {$e->getMessage()}", [
                'enrollmentId' => $enrollmentId,
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Error approving enrollment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function rejectEnrollment(Request $request, $enrollmentId)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string',
        ]);

        try {
            $enrollment = Enrollment::find($enrollmentId);

            if (!$enrollment) {
                return response()->json(['message' => 'Enrollment not found'], 404);
            }

            if ($enrollment->status !== 'submitted') {
                return response()->json(['message' => 'Only submitted enrollments can be rejected'], 400);
            }

            $enrollment->update([
                'status' => 'rejected',
                'rejection_reason' => $validated['rejection_reason'],
            ]);

            // Envoyer une notification au candidat (dans la base de données)
            try {
                NotificationService::notifyCandidateOnEnrollmentRejection($enrollment);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to send rejection notification: {$e->getMessage()}");
            }

            // Envoyer un email de rejet au candidat
            $emailSent = false;
            try {
                $emailSent = NotificationService::sendEnrollmentRejectionEmail($enrollment);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to send rejection email: {$e->getMessage()}");
            }

            return response()->json([
                'message' => 'Enrollment rejected successfully',
                'enrollment' => $enrollment,
                'email_sent' => $emailSent,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Error in rejectEnrollment: {$e->getMessage()}", [
                'enrollmentId' => $enrollmentId,
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Error rejecting enrollment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function downloadCertificate($enrollmentId)
    {
        try {
            $enrollment = Enrollment::find($enrollmentId);

            if (!$enrollment) {
                return response()->json(['message' => 'Enrollment not found'], 404);
            }

            if (!$enrollment->candidate_code) {
                return response()->json(['message' => 'Enrollment not approved yet'], 400);
            }

            $certificatePath = \App\Services\EnrollmentCertificateService::getCertificatePath($enrollment);

            if (!$certificatePath || !file_exists($certificatePath)) {
                // Generate certificate if it doesn't exist
                $certificatePath = \App\Services\EnrollmentCertificateService::generateCertificate($enrollment, $enrollment->candidate_code);
            }

            return response()->download($certificatePath, 'fiche_inscription_' . $enrollment->candidate_code . '.pdf');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Error downloading certificate: {$e->getMessage()}");
            return response()->json([
                'message' => 'Error downloading certificate',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function downloadMyCertificate()
    {
        try {
            $candidateId = auth('api')->id();
            $enrollment = Enrollment::where('candidate_id', $candidateId)->first();

            if (!$enrollment) {
                return response()->json(['message' => 'Enrollment not found'], 404);
            }

            if (!$enrollment->candidate_code) {
                return response()->json(['message' => 'Enrollment not approved yet'], 400);
            }

            $certificatePath = \App\Services\EnrollmentCertificateService::getCertificatePath($enrollment);

            if (!$certificatePath || !file_exists($certificatePath)) {
                // Generate certificate if it doesn't exist
                $certificatePath = \App\Services\EnrollmentCertificateService::generateCertificate($enrollment, $enrollment->candidate_code);
            }

            return response()->download($certificatePath, 'fiche_inscription_' . $enrollment->candidate_code . '.pdf');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Error downloading my certificate: {$e->getMessage()}");
            return response()->json([
                'message' => 'Error downloading certificate',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
