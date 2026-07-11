<?php

namespace App\Repositories\Interfaces;

interface DashboardRepositoryInterface
{
    public function kpisForMunicipality(int $municipalityId): array;

    public function kpisProvinceWide(): array;

    public function municipalityComparison(): \Illuminate\Support\Collection;

    public function incidentTrends(?int $municipalityId, string $groupBy = 'month'): \Illuminate\Support\Collection;

    public function categoryBreakdown(?int $municipalityId): \Illuminate\Support\Collection;

    public function recentIncidents(?int $municipalityId, int $limit = 10): \Illuminate\Support\Collection;
}
