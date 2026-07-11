<?php

namespace App\Http\Controllers\Api\V1\Mao;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TechnicianController extends Controller
{
    /**
     * List technicians available within the officer's municipality,
     * used to populate the "Assign Technician" modal.
     */
    public function index(Request $request): JsonResponse
    {
        $technicians = User::query()
            ->where('role', 'technician')
            ->where('municipality_id', $request->user()->municipality_id)
            ->where('status', 'active')
            ->with('technicianProfile')
            ->get();

        return response()->json(['data' => UserResource::collection($technicians)]);
    }
}
