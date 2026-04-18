<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'requirements',
        'max_participants',
        'registration_fee',
        'registration_start_date',
        'registration_end_date',
        'contest_date',
        'location',
        'status',
        'prizes',
        'contact_email',
        'contact_phone',
        'exam_center_id',
        'deposit_center_id',
        'department_id',
        'filiere_id',
        'min_age',
        'max_age',
    ];

    protected $casts = [
        'registration_start_date' => 'datetime',
        'registration_end_date' => 'datetime',
        'contest_date' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function examCenter(): BelongsTo
    {
        return $this->belongsTo(ExamCenter::class);
    }

    public function depositCenter(): BelongsTo
    {
        return $this->belongsTo(DepositCenter::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class);
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(ContestRegistration::class);
    }

    public function candidates()
    {
        return $this->hasManyThrough(Candidate::class, ContestRegistration::class);
    }

    public function isOpen()
    {
        // Un concours est ouvert si:
        // 1. Le statut n'est pas 'closed', 'ongoing', ou 'completed' ET
        // 2. La date de fin d'inscription n'est pas encore passée (now() <= registration_end_date)
        $closedStatuses = ['closed', 'ongoing', 'completed'];

        return ! in_array($this->status, $closedStatuses) && now()->lte($this->registration_end_date);
    }

    public function getParticipantCount()
    {
        return $this->registrations()->where('status', '!=', 'disqualified')->count();
    }

    public function checkAgeRequirements($dateOfBirth)
    {
        // Si pas de critères d'âge, le candidat est accepté
        if (! $this->min_age && ! $this->max_age) {
            return [
                'valid' => true,
                'message' => null,
            ];
        }

        // Calculer l'âge du candidat
        $birthDate = Carbon::parse($dateOfBirth);
        $age = $birthDate->diffInYears(now());

        // Vérifier l'âge minimum
        if ($this->min_age && $age < $this->min_age) {
            return [
                'valid' => false,
                'message' => "Vous devez avoir au minimum {$this->min_age} ans pour participer à ce concours. Votre âge actuel: {$age} ans.",
            ];
        }

        // Vérifier l'âge maximum
        if ($this->max_age && $age > $this->max_age) {
            return [
                'valid' => false,
                'message' => "Vous devez avoir au maximum {$this->max_age} ans pour participer à ce concours. Votre âge actuel: {$age} ans.",
            ];
        }

        return [
            'valid' => true,
            'message' => null,
        ];
    }
}
