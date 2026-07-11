<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::query()->with('user:id,first_name,last_name,role')->latest();

        if ($request->filled('action')) {
            $query->where('action', 'like', '%'.$request->query('action').'%');
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->query('user_id'));
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->query('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->query('date_to'));
        }

        $logs = $query->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => $logs->through(fn ($log) => [
                'id' => $log->id,
                'action' => $log->action,
                'auditable_type' => class_basename($log->auditable_type ?? ''),
                'auditable_id' => $log->auditable_id,
                'old_values' => $log->old_values,
                'new_values' => $log->new_values,
                'ip_address' => $log->ip_address,
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'full_name' => $log->user->full_name,
                    'role' => $log->user->role,
                ] : null,
                'created_at' => $log->created_at,
            ]),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'total' => $logs->total(),
            ],
        ]);
    }
}
