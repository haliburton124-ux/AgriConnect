<?php

namespace App\Http\Controllers\Api\V1\Gis;

use App\Http\Controllers\Controller;
use App\Services\IncidentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Powers the interactive Leaflet map: cluster markers, heatmap layer,
 * and the GIS filter modal (municipality, barangay, category, severity, date).
 * Available to Municipal Office (scoped to their own LGU), Provincial
 * Office and Admin (province-wide), and Technicians (scoped to only their
 * own assigned incidents — never another technician's caseload).
 */
class GisController extends Controller
{
    public function __construct(protected IncidentService $incidentService)
    {
    }

    /**
     * Applies the same role-based scoping rules to both mapPoints() and
     * heatmap() so neither endpoint can be used to bypass the other's
     * access control.
     */
    protected function scopedFilters(Request $request, array $baseFilters): array
    {
        $user = $request->user();
        $filters = $baseFilters;

        if ($user->hasRole('municipal_office')) {
            // Always the officer's own LGU, regardless of query params —
            // prevents cross-municipality data leakage via GIS filters.
            $filters['municipality_id'] = $user->municipality_id;
        } elseif ($user->hasRole('technician')) {
            // A technician only ever sees incidents assigned to them.
            $filters['assigned_technician_id'] = $user->id;
        } elseif ($request->filled('municipality_id')) {
            $filters['municipality_id'] = $request->query('municipality_id');
        }

        return $filters;
    }

    public function mapPoints(Request $request): JsonResponse
    {
        $filters = $this->scopedFilters($request, $request->only(['status', 'severity', 'category_id', 'barangay_id', 'date_from', 'date_to']));

        $points = $this->incidentService->repository()->mapPoints($filters);

        return response()->json([
            'data' => $points->map(fn ($incident) => [
                'id' => $incident->id,
                'reference_code' => $incident->reference_code,
                'title' => $incident->title,
                'status' => $incident->status,
                'severity' => $incident->severity,
                'latitude' => (float) $incident->latitude,
                'longitude' => (float) $incident->longitude,
                'category' => $incident->category ? [
                    'name' => $incident->category->name,
                    'icon' => $incident->category->icon,
                    'color' => $incident->category->color,
                ] : null,
                'created_at' => $incident->created_at,
            ]),
        ]);
    }

    /**
     * Heatmap intensity points: same coordinates, weighted by severity,
     * formatted for Leaflet.heat ([lat, lng, intensity]).
     */
    public function heatmap(Request $request): JsonResponse
    {
        $filters = $this->scopedFilters($request, $request->only(['status', 'category_id', 'date_from', 'date_to']));

        $weights = ['low' => 0.3, 'medium' => 0.5, 'high' => 0.8, 'critical' => 1.0];

        $points = $this->incidentService->repository()->mapPoints($filters);

        return response()->json([
            'data' => $points->map(fn ($incident) => [
                (float) $incident->latitude,
                (float) $incident->longitude,
                $weights[$incident->severity] ?? 0.5,
            ]),
        ]);
    }
}
