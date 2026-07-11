<?php

namespace App\Http\Controllers\Api\V1\Mao;

use App\Http\Controllers\Controller;
use App\Http\Requests\Incident\AssignTechnicianRequest;
use App\Http\Requests\Incident\RejectIncidentRequest;
use App\Http\Requests\Incident\ValidateIncidentRequest;
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
        $incidents = $this->incidentService->repository()->paginateForMunicipality(
            $request->user()->municipality_id,
            $request->only(['status', 'severity', 'category_id', 'barangay_id', 'search', 'date_from', 'date_to']),
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

    public function validateIncident(ValidateIncidentRequest $request, Incident $incident): JsonResponse
    {
        $this->authorize('validateIncident', $incident);

        $updated = $this->incidentService->validateIncident($incident, $request->user(), $request->validated('remarks'));

        return response()->json([
            'message' => 'Incident validated successfully. It is now ready for technician assignment.',
            'data' => new IncidentResource($updated),
        ]);
    }

    public function reject(RejectIncidentRequest $request, Incident $incident): JsonResponse
    {
        $this->authorize('reject', $incident);

        $updated = $this->incidentService->reject($incident, $request->user(), $request->validated('rejection_reason'));

        return response()->json([
            'message' => 'Incident has been rejected.',
            'data' => new IncidentResource($updated),
        ]);
    }

    public function assign(AssignTechnicianRequest $request, Incident $incident): JsonResponse
    {
        $this->authorize('assignTechnician', $incident);

        $updated = $this->incidentService->assignTechnician(
            $incident,
            $request->user(),
            $request->validated('technician_id'),
            $request->validated('notes'),
        );

        return response()->json([
            'message' => 'Technician assigned successfully.',
            'data' => new IncidentResource($updated->load('assignedTechnician')),
        ]);
    }
}
