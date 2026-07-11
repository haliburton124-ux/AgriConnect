<?php

namespace App\Http\Controllers\Api\V1\Technician;

use App\Http\Controllers\Controller;
use App\Http\Requests\Incident\StoreRecommendationRequest;
use App\Http\Requests\Incident\UpdateIncidentStatusRequest;
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
        $incidents = $this->incidentService->repository()->paginateForTechnician(
            $request->user(),
            $request->only(['status', 'severity', 'category_id', 'search']),
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

    public function show(Request $request, Incident $incident): JsonResponse
    {
        $this->authorize('view', $incident);

        return response()->json(['data' => new IncidentResource($this->incidentService->find($incident->id))]);
    }

    public function updateStatus(UpdateIncidentStatusRequest $request, Incident $incident): JsonResponse
    {
        $this->authorize('updateStatus', $incident);

        $updated = $this->incidentService->updateStatus(
            $incident,
            $request->user(),
            $request->validated('status'),
            $request->validated('notes'),
        );

        return response()->json([
            'message' => "Incident marked as {$updated->status}.",
            'data' => new IncidentResource($updated->load('statusHistories.changedBy')),
        ]);
    }

    public function storeRecommendation(StoreRecommendationRequest $request, Incident $incident): JsonResponse
    {
        $this->authorize('addRecommendation', $incident);

        $updated = $this->incidentService->addRecommendation($incident, $request->user(), $request->validated());

        return response()->json([
            'message' => 'Recommendation submitted successfully.',
            'data' => new IncidentResource($updated),
        ], 201);
    }
}
