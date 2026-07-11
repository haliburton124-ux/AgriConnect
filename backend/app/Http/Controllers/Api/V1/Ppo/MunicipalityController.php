<?php

namespace App\Http\Controllers\Api\V1\Ppo;

use App\Http\Controllers\Controller;
use App\Models\Municipality;
use App\Repositories\Interfaces\DashboardRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Province-wide municipality directory + per-municipality drill-down —
 * powers the Provincial Office's "Municipality Comparison" screen.
 */
class MunicipalityController extends Controller
{
    public function __construct(protected DashboardRepositoryInterface $dashboard)
    {
    }

    public function index(): JsonResponse
    {
        return response()->json(['data' => $this->dashboard->municipalityComparison()]);
    }

    public function show(Request $request, Municipality $municipality): JsonResponse
    {
        $kpis = $this->dashboard->kpisForMunicipality($municipality->id);
        $categoryBreakdown = $this->dashboard->categoryBreakdown($municipality->id);
        $trends = $this->dashboard->incidentTrends($municipality->id, $request->query('group_by', 'month'));
        $recentIncidents = $this->dashboard->recentIncidents($municipality->id, 10);

        $staffCounts = DB::table('users')
            ->where('municipality_id', $municipality->id)
            ->selectRaw("role, COUNT(*) as total")
            ->groupBy('role')
            ->pluck('total', 'role');

        return response()->json([
            'data' => [
                'municipality' => [
                    'id' => $municipality->id,
                    'name' => $municipality->name,
                    'type' => $municipality->type,
                    'latitude' => $municipality->latitude,
                    'longitude' => $municipality->longitude,
                ],
                'kpis' => $kpis,
                'staff_counts' => [
                    'farmers' => $staffCounts['farmer'] ?? 0,
                    'technicians' => $staffCounts['technician'] ?? 0,
                ],
                'category_breakdown' => $categoryBreakdown,
                'trends' => $trends,
                'recent_incidents' => $recentIncidents,
                'barangay_count' => $municipality->barangays()->count(),
            ],
        ]);
    }
}
