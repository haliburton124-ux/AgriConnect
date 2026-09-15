<?php

namespace App\Http\Controllers\Api\V1\Shared;

use App\Http\Controllers\Controller;
use App\Http\Requests\Appointment\StoreAppointmentRequest;
use App\Http\Requests\Appointment\UpdateAppointmentStatusRequest;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Shared between Farmer and Technician — visit scheduling for on-site
 * inspections and consultations. Each party only ever sees their own
 * appointments (enforced by the where() scoping below).
 */
class AppointmentController extends Controller
{
    /**
     * Technicians a farmer can book: only those already assigned to
     * this farmer's incidents.
     */
    public function technicians(Request $request): JsonResponse
    {
        $farmer = $request->user();
        abort_unless($farmer->hasRole('farmer'), 403);

        $assignedFromIncidents = DB::table('incidents')
            ->where('farmer_id', $farmer->id)
            ->whereNotNull('assigned_technician_id')
            ->pluck('assigned_technician_id');

        $assignedFromHistory = DB::table('incident_assignments')
            ->join('incidents', 'incidents.id', '=', 'incident_assignments.incident_id')
            ->where('incidents.farmer_id', $farmer->id)
            ->pluck('incident_assignments.technician_id');

        $assignedIds = $assignedFromIncidents
            ->merge($assignedFromHistory)
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->filter()
            ->values();

        $technicians = User::query()
            ->withArchived()
            ->whereIn('id', $assignedIds)
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'middle_name', 'last_name', 'suffix', 'phone']);

        return response()->json([
            'data' => $technicians
                ->map(fn (User $tech) => [
                    'id' => $tech->id,
                    'full_name' => $tech->full_name,
                    'phone' => $tech->phone,
                    'assigned' => true,
                ])
                ->values()
                ->all(),
        ]);
    }

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
        abort_unless($user->hasRole('technician') && $user->id === $appointment->technician_id, 403);

        $nextStatus = $request->validated('status');
        $allowed = match ($appointment->status) {
            'scheduled' => ['confirmed', 'cancelled'],
            'confirmed' => ['completed', 'cancelled', 'no_show'],
            default => [],
        };

        abort_unless(in_array($nextStatus, $allowed, true), 422, 'This appointment cannot move to that status yet.');

        $payload = ['status' => $nextStatus];
        if ($nextStatus === 'completed') {
            $payload['completion_findings'] = $request->validated('completion_findings');
            $payload['completion_outcome'] = $request->validated('completion_outcome');
            $payload['completion_follow_up'] = $request->validated('completion_follow_up') ?? null;
        }

        $appointment->update($payload);

        return response()->json(['message' => 'Appointment updated.', 'data' => $appointment]);
    }
}
