<?php

namespace App\Repositories\Eloquent;

use App\Models\Incident;
use App\Models\User;
use App\Repositories\Interfaces\IncidentRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class IncidentRepository implements IncidentRepositoryInterface
{
    public function __construct(protected Incident $model)
    {
    }

    public function find(int $id): ?Incident
    {
        return $this->model->with([
            'farmer', 'farm', 'category', 'municipality', 'barangay',
            'assignedTechnician', 'media', 'statusHistories.changedBy',
            'recommendations.technician',
        ])->find($id);
    }

    public function create(array $data): Incident
    {
        return $this->model->create($data);
    }

    public function update(Incident $incident, array $data): Incident
    {
        $incident->update($data);

        return $incident->refresh();
    }

    protected function applyFilters($query, array $filters)
    {
        if (! empty($filters['municipality_id'])) {
            $query->where('municipality_id', $filters['municipality_id']);
        }
        if (! empty($filters['assigned_technician_id'])) {
            $query->where('assigned_technician_id', $filters['assigned_technician_id']);
        }
        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (! empty($filters['severity'])) {
            $query->where('severity', $filters['severity']);
        }
        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }
        if (! empty($filters['barangay_id'])) {
            $query->where('barangay_id', $filters['barangay_id']);
        }
        if (! empty($filters['date_from'])) {
            $query->whereDate('incident_date', '>=', $filters['date_from']);
        }
        if (! empty($filters['date_to'])) {
            $query->whereDate('incident_date', '<=', $filters['date_to']);
        }
        if (! empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                    ->orWhere('reference_code', 'like', "%{$term}%");
            });
        }

        return $query;
    }

    public function paginateForFarmer(User $farmer, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->with(['category', 'assignedTechnician', 'farm'])
            ->where('farmer_id', $farmer->id)
            ->latest();

        return $this->applyFilters($query, $filters)->paginate($perPage);
    }

    public function paginateForTechnician(User $technician, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->with(['category', 'farmer', 'farm', 'barangay'])
            ->where('assigned_technician_id', $technician->id)
            ->latest();

        return $this->applyFilters($query, $filters)->paginate($perPage);
    }

    public function paginateForMunicipality(int $municipalityId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->with(['category', 'farmer', 'assignedTechnician', 'barangay'])
            ->where('municipality_id', $municipalityId)
            ->latest();

        return $this->applyFilters($query, $filters)->paginate($perPage);
    }

    public function paginateProvinceWide(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->with(['category', 'municipality', 'barangay'])->latest();

        return $this->applyFilters($query, $filters)->paginate($perPage);
    }

    public function mapPoints(array $filters = []): Collection
    {
        $query = $this->model->select([
            'id', 'reference_code', 'title', 'status', 'severity',
            'latitude', 'longitude', 'category_id', 'municipality_id', 'barangay_id', 'created_at',
        ])->with(['category:id,name,icon,color']);

        return $this->applyFilters($query, $filters)->get();
    }

    public function latestReferenceSequence(int $year): int
    {
        $last = $this->model
            ->where('reference_code', 'like', "AGC-{$year}-%")
            ->orderByDesc('id')
            ->first();

        if (! $last) {
            return 0;
        }

        return (int) substr($last->reference_code, -6);
    }
}
