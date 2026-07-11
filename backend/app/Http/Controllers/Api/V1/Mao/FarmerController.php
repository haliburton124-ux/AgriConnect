<?php

namespace App\Http\Controllers\Api\V1\Mao;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Read-only directory of farmers registered within the officer's own
 * municipality — powers the MAO "Farmers" screen. Scoped server-side to
 * municipality_id so an officer can never browse another LGU's farmers.
 */
class FarmerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query()
            ->where('role', 'farmer')
            ->where('municipality_id', $request->user()->municipality_id)
            ->with(['barangay', 'farms' => fn ($q) => $q->select('id', 'farmer_id', 'farm_name', 'farm_type')])
            ->withCount('reportedIncidents');

        if ($request->filled('barangay_id')) {
            $query->where('barangay_id', $request->query('barangay_id'));
        }

        if ($request->filled('search')) {
            $term = $request->query('search');
            $query->where(function ($q) use ($term) {
                $q->where('first_name', 'like', "%{$term}%")
                    ->orWhere('last_name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%")
                    ->orWhere('phone', 'like', "%{$term}%");
            });
        }

        $farmers = $query->latest()->paginate($request->integer('per_page', 15));

        return response()->json([
            'data' => $farmers->through(fn ($farmer) => [
                'id' => $farmer->id,
                'full_name' => $farmer->full_name,
                'email' => $farmer->email,
                'phone' => $farmer->phone,
                'status' => $farmer->status,
                'barangay' => $farmer->barangay ? ['id' => $farmer->barangay->id, 'name' => $farmer->barangay->name] : null,
                'farm_count' => $farmer->farms->count(),
                'incident_count' => $farmer->reported_incidents_count,
                'created_at' => $farmer->created_at,
            ]),
            'meta' => [
                'current_page' => $farmers->currentPage(),
                'last_page' => $farmers->lastPage(),
                'total' => $farmers->total(),
            ],
        ]);
    }

    public function show(Request $request, User $farmer): JsonResponse
    {
        abort_unless(
            $farmer->role === 'farmer' && $farmer->municipality_id === $request->user()->municipality_id,
            403,
            'This farmer is not registered in your municipality.'
        );

        $farmer->load(['barangay', 'municipality', 'farms', 'reportedIncidents' => fn ($q) => $q->latest()->limit(10)->with('category:id,name,color')]);

        return response()->json([
            'data' => [
                'id' => $farmer->id,
                'full_name' => $farmer->full_name,
                'email' => $farmer->email,
                'phone' => $farmer->phone,
                'status' => $farmer->status,
                'municipality' => $farmer->municipality ? ['id' => $farmer->municipality->id, 'name' => $farmer->municipality->name] : null,
                'barangay' => $farmer->barangay ? ['id' => $farmer->barangay->id, 'name' => $farmer->barangay->name] : null,
                'farms' => $farmer->farms->map(fn ($farm) => [
                    'id' => $farm->id,
                    'farm_name' => $farm->farm_name,
                    'farm_type' => $farm->farm_type,
                    'area_hectares' => $farm->area_hectares,
                ]),
                'recent_incidents' => $farmer->reportedIncidents->map(fn ($incident) => [
                    'id' => $incident->id,
                    'reference_code' => $incident->reference_code,
                    'title' => $incident->title,
                    'status' => $incident->status,
                    'severity' => $incident->severity,
                    'category' => $incident->category?->name,
                    'incident_date' => $incident->incident_date,
                ]),
                'created_at' => $farmer->created_at,
            ],
        ]);
    }
}
