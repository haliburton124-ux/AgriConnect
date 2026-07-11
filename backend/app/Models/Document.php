<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    public const VISIBILITY_PERSONAL = 'personal';
    public const VISIBILITY_MUNICIPALITY = 'municipality_only';

    public const MUNICIPALITY_CATEGORIES = [
        'memorandum', 'internal_announcement', 'report', 'permit', 'confidential',
    ];

    protected $fillable = [
        'user_id', 'title', 'file_path', 'mime_type', 'size_bytes',
        'category', 'visibility', 'municipality_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class);
    }

    public function isMunicipalityOnly(): bool
    {
        return $this->visibility === self::VISIBILITY_MUNICIPALITY;
    }
}
