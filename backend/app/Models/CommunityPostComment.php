<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

class CommunityPostComment extends Model
{
    protected $fillable = ['community_post_id', 'user_id', 'parent_id', 'body'];

    public function post(): BelongsTo
    {
        return $this->belongsTo(CommunityPost::class, 'community_post_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->oldest();
    }

    /**
     * Build a nested comment tree from a flat list (supports unlimited depth).
     *
     * @param  Collection<int, self>|EloquentCollection<int, self>  $comments
     * @return EloquentCollection<int, self>
     */
    public static function assembleTree(Collection|EloquentCollection $comments, ?int $parentId = null, bool $rootLevel = true): EloquentCollection
    {
        $branch = $comments->filter(fn (self $comment) => $comment->parent_id === $parentId);

        $branch = $rootLevel
            ? $branch->sortByDesc('created_at')
            : $branch->sortBy('created_at');

        return new EloquentCollection($branch->map(function (self $comment) use ($comments) {
            $comment->setRelation(
                'replies',
                self::assembleTree($comments, $comment->id, false),
            );

            return $comment;
        })->values()->all());
    }
}
