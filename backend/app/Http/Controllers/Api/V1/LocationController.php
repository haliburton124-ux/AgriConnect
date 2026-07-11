<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Barangay;
use App\Models\IncidentCategory;
use App\Models\Municipality;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Public/shared reference-data lookups used across all role dashboards
 * (registration forms, incident report forms, GIS filters, etc.).
 */
class LocationController extends Controller
{
    public function municipalities(): JsonResponse
    {
        return response()->json([
            'data' => Municipality::orderBy('name')->get(['id', 'name', 'type', 'latitude', 'longitude']),
        ]);
    }

    public function barangays(Request $request): JsonResponse
    {
        $request->validate(['municipality_id' => ['required', 'exists:municipalities,id']]);

        return response()->json([
            'data' => Barangay::where('municipality_id', $request->query('municipality_id'))
                ->orderBy('name')
                ->get(['id', 'name', 'latitude', 'longitude']),
        ]);
    }

    public function incidentCategories(): JsonResponse
    {
        return response()->json([
            'data' => IncidentCategory::where('is_active', true)->orderBy('name')->get(),
        ]);
    }
}
