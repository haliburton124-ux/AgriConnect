<?php

namespace App\Repositories\Interfaces;

use App\Models\Incident;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

interface IncidentRepositoryInterface
{
    public function find(int $id): ?Incident;

    public function create(array $data): Incident;

    public function update(Incident $incident, array $data): Incident;

    public function paginateForFarmer(User $farmer, array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function paginateForTechnician(User $technician, array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function paginateForMunicipality(int $municipalityId, array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function paginateProvinceWide(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function mapPoints(array $filters = []): \Illuminate\Support\Collection;

    public function latestReferenceSequence(int $year): int;
}
