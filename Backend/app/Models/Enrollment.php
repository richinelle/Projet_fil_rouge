<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'candidate_id',
        'department_id',
        'filiere_id',
        'exam_center_id',
        'deposit_center_id',
        'full_name',
        'date_of_birth',
        'gender',
        'nationality',
        'id_number',
        'id_type',
        'cni_number',
        'address',
        'city',
        'country',
        'postal_code',
        'education_level',
        'school_name',
        'field_of_study',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
        'status',
        'submitted_at',
        'approved_at',
        'rejection_reason',
        'candidate_code',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class);
    }

    public function examCenter(): BelongsTo
    {
        return $this->belongsTo(ExamCenter::class);
    }

    public function depositCenter(): BelongsTo
    {
        return $this->belongsTo(DepositCenter::class);
    }

    public function documents()
    {
        return $this->hasMany(EnrollmentDocument::class);
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    public function approvalHistory()
    {
        return $this->hasMany(EnrollmentApprovalHistory::class);
    }
}
