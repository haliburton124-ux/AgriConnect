<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Advisory extends Model
{
    protected $fillable = [
        'issued_by', 'title', 'content', 'type', 'severity',
        'municipality_id', 'valid_from', 'valid_until', 'is_published',
    ];

    protected $casts = [
        'valid_from' => 'date',
        'valid_until' => 'date',
        'is_published' => 'boolean',
    ];

    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class);
    }
}
