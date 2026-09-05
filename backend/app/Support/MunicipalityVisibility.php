<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

/**
 * Municipality-based visibility for Knowledge Center and related farmer content.
 * MAO posts are always owned by the officer's assigned municipality.
 * Farmers and technicians only see content from their registered municipality.
 */
class MunicipalityVisibility
{
    public static function applyViewerScope(Builder $query, Request $request, string $column = 'municipality_id'): void
    {
        $user = $request->user();

        if (! $user) {
            return;
        }

        if ($user->hasRole(['farmer', 'technician']) && $user->municipality_id) {
            $query->where($column, $user->municipality_id);

            return;
        }

        if ($user->hasRole('municipal_office') && $user->municipality_id) {
            $query->where($column, $user->municipality_id);
        }
    }

    public static function assertCanView(?User $user, ?int $contentMunicipalityId): void
    {
        if (! $user) {
            return;
        }

        if ($user->hasRole(['provincial_office', 'admin'])) {
            return;
        }

        if ($user->hasRole(['farmer', 'technician', 'municipal_office'])) {
            abort_unless(
                $user->municipality_id && $contentMunicipalityId && (int) $user->municipality_id === (int) $contentMunicipalityId,
                403,
                'This content is not available in your municipality.'
            );
        }
    }

    public static function municipalityIdForCreate(User $user, mixed $requested = null): int
    {
        if ($user->hasRole('municipal_office')) {
            abort_unless($user->municipality_id, 422, 'Your account is not assigned to a municipality.');

            return (int) $user->municipality_id;
        }

        $id = $requested ? (int) $requested : (int) $user->municipality_id;
        abort_unless($id, 422, 'A municipality must be specified for this content.');

        return $id;
    }

    public static function assertCanManage(User $user, ?int $contentMunicipalityId): void
    {
        if ($user->hasRole(['provincial_office', 'admin'])) {
            return;
        }

        abort_unless($user->hasRole('municipal_office'), 403);
        abort_unless(
            $user->municipality_id && $contentMunicipalityId && (int) $user->municipality_id === (int) $contentMunicipalityId,
            403,
            'You can only manage Knowledge Center content for your assigned municipality.'
        );
    }
}
