<?php

namespace App\Http\Controllers\Api\V1\Shared;

use App\Http\Controllers\Controller;
use App\Http\Requests\Appointment\StoreAppointmentRequest;
use App\Http\Requests\Appointment\UpdateAppointmentStatusRequest;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Shared between Farmer and Technician — visit scheduling for on-site
 * inspections and consultations. Each party only ever sees their own
 * appointments (enforced by the where() scoping below).
 */
class AppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Appointment::with(['farmer:id,first_name,last_name,phone', 'technician:id,first_name,last_name,phone', 'incident:id,reference_code,title'])
            ->when($user->hasRole('farmer'), fn ($q) => $q->where('farmer_id', $user->id))
            ->when($user->hasRole('technician'), fn ($q) => $q->where('technician_id', $user->id))
            ->orderBy('scheduled_at');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $appointments = $query->paginate($request->integer('per_page', 15));

        return response()->json([
            'data' => $appointments->items(),
            'meta' => [
                'current_page' => $appointments->currentPage(),
                'last_page' => $appointments->lastPage(),
                'total' => $appointments->total(),
            ],
        ]);
    }

    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $appointment = Appointment::create([
            'incident_id' => $data['incident_id'] ?? null,
            'farm_id' => $data['farm_id'] ?? null,
            'farmer_id' => $user->hasRole('farmer') ? $user->id : $data['farmer_id'],
            'technician_id' => $user->hasRole('technician') ? $user->id : $data['technician_id'],
            'scheduled_at' => $data['scheduled_at'],
            'purpose' => $data['purpose'] ?? null,
            'notes' => $data['notes'] ?? null,
            'status' => 'scheduled',
        ]);

        return response()->json([
            'message' => 'Appointment scheduled successfully.',
            'data' => $appointment->load(['farmer', 'technician']),
        ], 201);
    }

    public function updateStatus(UpdateAppointmentStatusRequest $request, Appointment $appointment): JsonResponse
    {
        $user = $request->user();
        abort_unless(in_array($user->id, [$appointment->farmer_id, $appointment->technician_id], true), 403);

        $appointment->update(['status' => $request->validated('status')]);

        return response()->json(['message' => 'Appointment updated.', 'data' => $appointment]);
    }
}
