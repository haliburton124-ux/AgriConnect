<?php

namespace App\Repositories\Eloquent;

use App\Models\Incident;
use App\Models\Municipality;
use App\Repositories\Interfaces\DashboardRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DashboardRepository implements DashboardRepositoryInterface
{
    public function __construct(protected Incident $model)
    {
    }

    protected function baseCounts($query): array
    {
        return [
            'total' => (clone $query)->count(),
            'today' => (clone $query)->whereDate('created_at', today())->count(),
            'pending' => (clone $query)->where('status', 'pending')->count(),
            'validated' => (clone $query)->where('status', 'validated')->count(),
            'assigned' => (clone $query)->where('status', 'assigned')->count(),
            'ongoing' => (clone $query)->where('status', 'ongoing')->count(),
            'resolved' => (clone $query)->where('status', 'resolved')->count(),
            'rejected' => (clone $query)->where('status', 'rejected')->count(),
            'critical_open' => (clone $query)->where('severity', 'critical')
                ->whereNotIn('status', ['resolved', 'rejected'])->count(),
        ];
    }

    public function kpisForMunicipality(int $municipalityId): array
    {
        return $this->baseCounts($this->model->where('municipality_id', $municipalityId));
    }

    public function kpisProvinceWide(): array
    {
        return array_merge($this->baseCounts($this->model->query()), [
            'total_municipalities' => Municipality::count(),
            'total_farmers' => \App\Models\User::where('role', 'farmer')->count(),
            'total_technicians' => \App\Models\User::where('role', 'technician')->count(),
        ]);
    }

    public function municipalityComparison(): Collection
    {
        return Municipality::query()
            ->select('municipalities.id', 'municipalities.name')
            ->withCount([
                'incidents as total_incidents',
                'incidents as pending_incidents' => fn ($q) => $q->where('status', 'pending'),
                'incidents as resolved_incidents' => fn ($q) => $q->where('status', 'resolved'),
                'incidents as critical_incidents' => fn ($q) => $q->where('severity', 'critical'),
            ])
            ->orderByDesc('total_incidents')
            ->get();
    }

    public function incidentTrends(?int $municipalityId, string $groupBy = 'month'): Collection
    {
        $format = match ($groupBy) {
            'day' => '%Y-%m-%d',
            'year' => '%Y',
            default => '%Y-%m',
        };

        $query = $this->model->query()
            ->selectRaw("DATE_FORMAT(incident_date, '{$format}') as period, COUNT(*) as total")
            ->groupBy('period')
            ->orderBy('period');

        if ($municipalityId) {
            $query->where('municipality_id', $municipalityId);
        }

        return $query->get();
    }

    public function categoryBreakdown(?int $municipalityId): Collection
    {
        $query = $this->model->query()
            ->join('incident_categories', 'incidents.category_id', '=', 'incident_categories.id')
            ->selectRaw('incident_categories.name as category, incident_categories.color as color, COUNT(*) as total')
            ->groupBy('incident_categories.id', 'incident_categories.name', 'incident_categories.color')
            ->orderByDesc('total');

        if ($municipalityId) {
            $query->where('incidents.municipality_id', $municipalityId);
        }

        return $query->get();
    }

    public function recentIncidents(?int $municipalityId, int $limit = 10): Collection
    {
        $query = $this->model->query()
            ->with(['category', 'municipality', 'barangay', 'farmer'])
            ->latest()
            ->limit($limit);

        if ($municipalityId) {
            $query->where('municipality_id', $municipalityId);
        }

        return $query->get();
    }
}
