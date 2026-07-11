<?php

namespace App\Http\Controllers\Api\V1\Mao;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(protected DashboardService $dashboardService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $data = $this->dashboardService->forMunicipality(
            $request->user()->municipality_id,
            $request->query('group_by', 'month'),
        );

        return response()->json(['data' => $data]);
    }
}
