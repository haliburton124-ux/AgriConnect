<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AuditLogController extends Controller
{
    public function filters(): JsonResponse
    {
        return response()->json([
            'data' => [
                'modules' => AuditLogger::modules(),
                'roles' => ['admin', 'provincial_office', 'municipal_office', 'technician', 'farmer'],
            ],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $logs = $this->filteredQuery($request)
            ->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => collect($logs->items())->map(fn (AuditLog $log) => $this->transform($log))->values(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $query = $this->filteredQuery($request)->limit(10000);

        $filename = 'agriconnect-audit-logs-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'Timestamp', 'User', 'Role', 'Municipality', 'Module', 'Action',
                'Record ID', 'Description', 'IP Address',
            ]);

            $query->chunk(200, function ($logs) use ($handle) {
                foreach ($logs as $log) {
                    /** @var AuditLog $log */
                    fputcsv($handle, [
                        $log->created_at?->toDateTimeString(),
                        $log->user?->full_name ?? 'System',
                        $log->user_role ?? $log->user?->role ?? '',
                        $log->municipality?->name ?? $log->user?->municipality?->name ?? '',
                        $log->module ?? '',
                        $log->action,
                        $log->auditable_id ?? '',
                        $log->description ?? '',
                        $log->ip_address ?? '',
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    protected function filteredQuery(Request $request)
    {
        $query = AuditLog::query()
            ->with(['user:id,first_name,last_name,role,municipality_id', 'user.municipality:id,name', 'municipality:id,name'])
            ->latest();

        if ($request->filled('search')) {
            $term = $request->query('search');
            $query->where(function ($q) use ($term) {
                $q->where('action', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%")
                    ->orWhere('module', 'like', "%{$term}%");
            });
        }

        if ($request->filled('action')) {
            $query->where('action', 'like', '%'.$request->query('action').'%');
        }

        if ($request->filled('module')) {
            $query->where('module', $request->query('module'));
        }

        if ($request->filled('user_role')) {
            $query->where('user_role', $request->query('user_role'));
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        if ($request->filled('municipality_id')) {
            $query->where('municipality_id', $request->integer('municipality_id'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->query('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->query('date_to'));
        }

        return $query;
    }

    protected function transform(AuditLog $log): array
    {
        return [
            'id' => $log->id,
            'action' => $log->action,
            'module' => $log->module,
            'description' => $log->description,
            'auditable_type' => class_basename($log->auditable_type ?? ''),
            'auditable_id' => $log->auditable_id,
            'old_values' => $log->old_values,
            'new_values' => $log->new_values,
            'ip_address' => $log->ip_address,
            'user_role' => $log->user_role ?? $log->user?->role,
            'user' => $log->user ? [
                'id' => $log->user->id,
                'full_name' => $log->user->full_name,
                'role' => $log->user->role,
            ] : null,
            'municipality' => $log->municipality ?? $log->user?->municipality,
            'created_at' => $log->created_at,
        ];
    }
}
