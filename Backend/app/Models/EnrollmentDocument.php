<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EnrollmentDocument extends Model
{
    protected $fillable = [
        'enrollment_id',
        'document_type',
        'contest_id',
        'file_path',
        'original_filename',
        'mime_type',
        'file_size',
    ];

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function contest(): BelongsTo
    {
        return $this->belongsTo(Contest::class);
    }
}
