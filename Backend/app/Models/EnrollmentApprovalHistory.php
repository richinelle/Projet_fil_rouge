<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EnrollmentApprovalHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_id',
        'admin_id',
        'action',
        'reason',
        'action_date',
    ];

    protected $casts = [
        'action_date' => 'datetime',
    ];

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
