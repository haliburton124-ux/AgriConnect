<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStaffUserRequest;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * List all users, filterable by role/municipality/status — powers the
     * Admin "Manage Users" table.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->with(['municipality', 'barangay']);

        if ($request->filled('role')) {
            $query->where('role', $request->query('role'));
        }
        if ($request->filled('municipality_id')) {
            $query->where('municipality_id', $request->query('municipality_id'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }
        if ($request->filled('search')) {
            $term = $request->query('search');
            $query->where(function ($q) use ($term) {
                $q->where('first_name', 'like', "%{$term}%")
                    ->orWhere('last_name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%");
            });
        }

        $users = $query->latest()->paginate($request->integer('per_page', 15));

        return response()->json([
            'data' => UserResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Provisions a staff account (Provincial Office, Municipal Office,
     * Technician, or another Admin). Public self-registration is farmers-only —
     * this is the only way non-farmer accounts get created.
     */
    public function store(StoreStaffUserRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'password' => Hash::make($data['password']),
                'role' => $data['role'],
                'municipality_id' => $data['municipality_id'] ?? null,
                'barangay_id' => $data['barangay_id'] ?? null,
                'status' => 'active',
                'email_verified_at' => now(),
            ]);

            if ($data['role'] === 'technician') {
                $user->technicianProfile()->create([
                    'license_number' => $data['license_number'] ?? null,
                    'specializations' => $data['specializations'] ?? [],
                    'assigned_municipality_id' => $data['municipality_id'] ?? null,
                    'availability' => 'available',
                ]);
            }

            return $user;
        });

        return response()->json([
            'message' => ucfirst(str_replace('_', ' ', $data['role'])).' account created successfully.',
            'data' => new UserResource($user->load(['municipality', 'barangay', 'technicianProfile'])),
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($user->load(['municipality', 'barangay', 'technicianProfile'])),
        ]);
    }

    public function updateStatus(UpdateUserStatusRequest $request, User $user): JsonResponse
    {
        $user->update(['status' => $request->validated('status')]);

        // Suspended/inactive accounts lose all active sessions immediately.
        if ($request->validated('status') !== 'active') {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => "User account marked as {$user->status}.",
            'data' => new UserResource($user),
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete(); // soft delete — preserves audit/report history

        return response()->json(['message' => 'User account removed.']);
    }
}
