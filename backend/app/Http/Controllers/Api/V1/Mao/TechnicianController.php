<?php

namespace App\Http\Controllers\Api\V1\Mao;

use App\Http\Controllers\Controller;
use App\Http\Requests\Mao\StoreMaoTechnicianRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TechnicianController extends Controller
{
    /**
     * List technicians available within the officer's municipality,
     * used to populate the "Assign Technician" modal and the MAO directory.
     */
    public function index(Request $request): JsonResponse
    {
        $workloadCap = 8;

        $technicians = User::query()
            ->where('role', 'technician')
            ->where('municipality_id', $request->user()->municipality_id)
            ->where('status', 'active')
            ->with(['technicianProfile', 'municipality', 'barangay'])
            ->withCount([
                'assignedIncidents as assigned_cases' => fn ($query) => $query->whereNotIn('status', ['resolved', 'rejected']),
            ])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->values();

        $resolved = UserResource::collection($technicians)->resolve($request);

        $data = collect($resolved)->map(function (array $item, int $index) use ($technicians, $workloadCap) {
            $tech = $technicians[$index];
            $profile = $tech->technicianProfile;
            $assigned = (int) ($tech->assigned_cases ?? 0);
            $specializations = $profile?->specializations ?? [];

            return array_merge($item, [
                'specializations' => is_array($specializations) ? array_values($specializations) : [],
                'years_experience' => (int) ($profile?->years_experience ?? 0),
                'license_number' => $profile?->license_number,
                'availability' => $profile?->availability ?? 'available',
                'assigned_cases' => $assigned,
                'workload' => min(100, (int) round(($assigned / $workloadCap) * 100)),
            ]);
        })->values();

        return response()->json(['data' => $data]);
    }

    public function store(StoreMaoTechnicianRequest $request): JsonResponse
    {
        $officer = $request->user();
        $data = $request->validated();

        $user = DB::transaction(function () use ($data, $officer) {
            $technician = User::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'password' => $data['password'],
                'role' => User::ROLE_TECHNICIAN,
                'municipality_id' => $officer->municipality_id,
                'barangay_id' => $data['barangay_id'],
                'status' => 'active',
                'email_verified_at' => now(),
            ]);

            $technician->technicianProfile()->create([
                'license_number' => $data['license_number'] ?? null,
                'specializations' => $data['specializations'] ?? [],
                'assigned_municipality_id' => $officer->municipality_id,
                'availability' => 'available',
            ]);

            return $technician;
        });

        return response()->json([
            'message' => 'Technician account created successfully.',
            'data' => new UserResource($user->load(['municipality', 'barangay', 'technicianProfile'])),
        ], 201);
    }
}
