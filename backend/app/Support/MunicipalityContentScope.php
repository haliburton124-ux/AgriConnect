<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

/**
 * Shared visibility rules for municipality-scoped public content.
 *
 * Farmers and technicians see province-wide items (municipality_id = null)
 * plus content for their own municipality. Staff roles see everything.
 */
class MunicipalityContentScope
{
    /** Province-wide + the user's municipality (nullable municipality_id column). */
    public static function applyNullableScope(Builder $query, Request $request, string $column = 'municipality_id'): void
    {
        $user = $request->user();

        if (! $user) {
            $query->whereNull($column);

            return;
        }

        if ($user->hasRole(['farmer', 'technician']) && $user->municipality_id) {
            $query->where(function ($q) use ($user, $column) {
                $q->whereNull($column)->orWhere($column, $user->municipality_id);
            });
        }
    }

    /** Only the user's municipality when authenticated as farmer/technician. */
    public static function applyStrictScope(Builder $query, Request $request, string $column = 'municipality_id'): void
    {
        $user = $request->user();

        if ($user?->hasRole(['farmer', 'technician']) && $user->municipality_id) {
            $query->where($column, $user->municipality_id);
        }
    }

    public static function canAccessNullableContent(?User $user, ?int $contentMunicipalityId): bool
    {
        if ($contentMunicipalityId === null) {
            return true;
        }

        if (! $user) {
            return false;
        }

        if ($user->hasRole(['municipal_office', 'provincial_office', 'admin'])) {
            return true;
        }

        if ($user->hasRole(['farmer', 'technician'])) {
            return (int) $user->municipality_id === (int) $contentMunicipalityId;
        }

        return false;
    }

    public static function canAccessStrictContent(?User $user, int $contentMunicipalityId): bool
    {
        if (! $user) {
            return true;
        }

        if ($user->hasRole(['municipal_office', 'provincial_office', 'admin'])) {
            return true;
        }

        if ($user->hasRole(['farmer', 'technician'])) {
            return (int) $user->municipality_id === (int) $contentMunicipalityId;
        }

        return true;
    }
}
