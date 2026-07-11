<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    protected $fillable = [
        'posted_by', 'title', 'content', 'cover_image_path',
        'municipality_id', 'audience', 'is_published', 'published_at',
    ];

    protected $casts = ['is_published' => 'boolean', 'published_at' => 'datetime'];

    public function postedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'posted_by');
    }

    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class);
    }
}
