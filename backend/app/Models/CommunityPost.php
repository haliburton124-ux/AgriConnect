<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommunityPost extends Model
{
    public const CATEGORIES = [
        'pesticide_usage',
        'crop_disease',
        'soil_management',
        'suitable_crops',
        'weather_advisory',
        'planting_calendar',
        'pest_outbreak',
        'irrigation',
        'fertilizer',
        'best_practices',
        'general',
    ];

    protected $fillable = [
        'municipality_id', 'author_id', 'title', 'content', 'category',
        'is_published', 'likes_count', 'comments_count', 'shares_count',
    ];

    protected $casts = ['is_published' => 'boolean'];

    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function likes(): HasMany
    {
        return $this->hasMany(CommunityPostLike::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(CommunityPostComment::class)->whereNull('parent_id');
    }

    public function allComments(): HasMany
    {
        return $this->hasMany(CommunityPostComment::class);
    }

    public function shares(): HasMany
    {
        return $this->hasMany(CommunityPostShare::class);
    }
}
