<?php

namespace App\Services;

use App\Repositories\Interfaces\DashboardRepositoryInterface;

class DashboardService
{
    public function __construct(protected DashboardRepositoryInterface $dashboard)
    {
    }

    public function forMunicipality(int $municipalityId, string $trendGroupBy = 'month'): array
    {
        return [
            'kpis' => $this->dashboard->kpisForMunicipality($municipalityId),
            'trends' => $this->dashboard->incidentTrends($municipalityId, $trendGroupBy),
            'category_breakdown' => $this->dashboard->categoryBreakdown($municipalityId),
            'recent_incidents' => $this->dashboard->recentIncidents($municipalityId),
        ];
    }

    public function provinceWide(string $trendGroupBy = 'month'): array
    {
        return [
            'kpis' => $this->dashboard->kpisProvinceWide(),
            'municipality_comparison' => $this->dashboard->municipalityComparison(),
            'trends' => $this->dashboard->incidentTrends(null, $trendGroupBy),
            'category_breakdown' => $this->dashboard->categoryBreakdown(null),
            'recent_incidents' => $this->dashboard->recentIncidents(null, 15),
        ];
    }
}
