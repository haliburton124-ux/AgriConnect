<?php

namespace App\Http\Controllers\Api\V1\Content;

use App\Http\Controllers\Controller;
use App\Http\Requests\Content\StoreAdvisoryRequest;
use App\Models\Advisory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdvisoryController extends Controller
{
    /**
     * Publicly browsable (guests see general/province-wide advisories
     * only). Farmers/technicians additionally see anything scoped to
     * their own municipality.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Advisory::query()->where('is_published', true)->with('issuedBy:id,first_name,last_name,role')->latest();

        if (! $user) {
            $query->whereNull('municipality_id');
        } elseif ($user->hasRole(['farmer', 'technician'])) {
            $query->where(function ($q) use ($user) {
                $q->whereNull('municipality_id')->orWhere('municipality_id', $user->municipality_id);
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->query('type'));
        }

        $advisories = $query->paginate($request->integer('per_page', 10));

        return response()->json([
            'data' => $advisories->items(),
            'meta' => [
                'current_page' => $advisories->currentPage(),
                'last_page' => $advisories->lastPage(),
                'total' => $advisories->total(),
            ],
        ]);
    }

    public function store(StoreAdvisoryRequest $request): JsonResponse
    {
        $user = $request->user();

        $advisory = Advisory::create([
            'issued_by' => $user->id,
            'title' => $request->validated('title'),
            'content' => $request->validated('content'),
            'type' => $request->validated('type'),
            'severity' => $request->validated('severity'),
            'municipality_id' => $user->hasRole('municipal_office') ? $user->municipality_id : null,
            'valid_from' => $request->validated('valid_from'),
            'valid_until' => $request->validated('valid_until'),
            'is_published' => $request->boolean('is_published', true),
        ]);

        return response()->json(['message' => 'Advisory issued successfully.', 'data' => $advisory], 201);
    }

    public function destroy(Advisory $advisory): JsonResponse
    {
        $advisory->delete();

        return response()->json(['message' => 'Advisory removed.']);
    }
}
