<?php

namespace App\Http\Controllers\Api\V1\Farmer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Farm\StoreFarmRequest;
use App\Http\Requests\Farm\UpdateFarmRequest;
use App\Http\Resources\FarmResource;
use App\Models\Farm;
use App\Services\FarmService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FarmController extends Controller
{
    public function __construct(protected FarmService $farmService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $farms = $this->farmService->listForFarmer($request->user());

        return response()->json(['data' => FarmResource::collection($farms)]);
    }

    public function store(StoreFarmRequest $request): JsonResponse
    {
        $farm = $this->farmService->register($request->user(), $request->validated());

        return response()->json([
            'message' => 'Farm registered successfully.',
            'data' => new FarmResource($farm),
        ], 201);
    }

    public function show(Request $request, Farm $farm): JsonResponse
    {
        $this->authorize('view', $farm);

        return response()->json(['data' => new FarmResource($farm->load('boundaries', 'municipality', 'barangay'))]);
    }

    public function update(UpdateFarmRequest $request, Farm $farm): JsonResponse
    {
        $updated = $this->farmService->update($farm, $request->validated());

        return response()->json([
            'message' => 'Farm updated successfully.',
            'data' => new FarmResource($updated),
        ]);
    }

    public function destroy(Request $request, Farm $farm): JsonResponse
    {
        $this->authorize('delete', $farm);
        $this->farmService->delete($farm);

        return response()->json(['message' => 'Farm removed successfully.']);
    }

    public function storeBoundary(Request $request, Farm $farm): JsonResponse
    {
        $this->authorize('update', $farm);

        $validated = $request->validate([
            'type' => ['required', 'in:Polygon'],
            'coordinates' => ['required', 'array'],
        ]);

        $this->farmService->attachBoundary($farm, $validated);

        return response()->json([
            'message' => 'Farm boundary saved successfully.',
            'data' => new FarmResource($farm->fresh('boundaries')),
        ], 201);
    }
}
