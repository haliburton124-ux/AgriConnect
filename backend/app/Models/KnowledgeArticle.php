<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KnowledgeArticle extends Model
{
    protected $fillable = [
        'category_id', 'title', 'slug', 'content', 'cover_image_path',
        'type', 'video_url', 'pdf_path', 'author_id', 'is_published', 'view_count',
    ];

    protected $casts = ['is_published' => 'boolean'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(KnowledgeCategory::class, 'category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
