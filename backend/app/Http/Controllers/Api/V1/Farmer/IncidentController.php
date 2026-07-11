<?php

namespace App\Http\Controllers\Api\V1\Farmer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Incident\StoreIncidentRequest;
use App\Http\Resources\IncidentResource;
use App\Models\Incident;
use App\Services\IncidentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IncidentController extends Controller
{
    public function __construct(protected IncidentService $incidentService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $incidents = $this->incidentService->repository()->paginateForFarmer(
            $request->user(),
            $request->only(['status', 'severity', 'category_id', 'search', 'date_from', 'date_to']),
        );

        return response()->json([
            'data' => IncidentResource::collection($incidents),
            'meta' => [
                'current_page' => $incidents->currentPage(),
                'last_page' => $incidents->lastPage(),
                'total' => $incidents->total(),
            ],
        ]);
    }

    public function store(StoreIncidentRequest $request): JsonResponse
    {
        $incident = $this->incidentService->report($request->user(), $request->validated());

        return response()->json([
            'message' => "Incident reported successfully. Reference code: {$incident->reference_code}",
            'data' => new IncidentResource($incident),
        ], 201);
    }

    public function show(Request $request, Incident $incident): JsonResponse
    {
        $this->authorize('view', $incident);

        return response()->json([
            'data' => new IncidentResource($this->incidentService->find($incident->id)),
        ]);
    }
}
