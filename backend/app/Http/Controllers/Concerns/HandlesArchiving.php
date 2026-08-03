<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

trait HandlesArchiving
{
    protected function applyArchiveScope(Builder $query, Request $request): Builder
    {
        if ($request->boolean('archived')) {
            return $query->onlyArchived();
        }

        return $query;
    }

    protected function archiveModel(Model $model, string $label): JsonResponse
    {
        $model->archive();

        return response()->json(['message' => "{$label} archived."]);
    }

    protected function restoreModel(string $modelClass, int $id, string $label): JsonResponse
    {
        /** @var Model&\App\Models\Concerns\Archivable $model */
        $model = $modelClass::withArchived()->findOrFail($id);
        $model->unarchive();

        return response()->json(['message' => "{$label} restored."]);
    }
}
