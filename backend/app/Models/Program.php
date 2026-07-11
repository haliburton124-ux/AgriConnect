<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    protected $fillable = [
        'title', 'description', 'cover_image_path', 'category',
        'application_start', 'application_end', 'eligibility_criteria',
        'is_active', 'created_by',
    ];

    protected $casts = [
        'application_start' => 'date',
        'application_end' => 'date',
        'eligibility_criteria' => 'array',
        'is_active' => 'boolean',
    ];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(ProgramApplication::class);
    }
}
