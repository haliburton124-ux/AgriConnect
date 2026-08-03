<?php

namespace App\Models\Concerns;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

trait Archivable
{
    public static function bootArchivable(): void
    {
        static::addGlobalScope('not_archived', function (Builder $query) {
            $query->where($query->qualifyColumn('is_archived'), false);
        });
    }

    public function initializeArchivable(): void
    {
        $this->casts['is_archived'] = 'boolean';
        $this->casts['archived_at'] = 'datetime';
    }

    public function archivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'archived_by');
    }

    public function archive(?int $userId = null): bool
    {
        return $this->forceFill([
            'is_archived' => true,
            'archived_at' => now(),
            'archived_by' => $userId ?? Auth::id(),
        ])->save();
    }

    public function unarchive(): bool
    {
        return $this->forceFill([
            'is_archived' => false,
            'archived_at' => null,
            'archived_by' => null,
        ])->save();
    }

    public function scopeWithArchived(Builder $query): Builder
    {
        return $query->withoutGlobalScope('not_archived');
    }

    public function scopeOnlyArchived(Builder $query): Builder
    {
        return $query->withoutGlobalScope('not_archived')->where($query->qualifyColumn('is_archived'), true);
    }
}
