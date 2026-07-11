<?php

namespace App\Services;

use App\Models\Farm;
use App\Models\User;
use App\Repositories\Interfaces\FarmRepositoryInterface;
use Illuminate\Support\Facades\DB;

class FarmService
{
    public function __construct(protected FarmRepositoryInterface $farms)
    {
    }

    public function listForFarmer(User $farmer)
    {
        return $this->farms->allForFarmer($farmer);
    }

    public function register(User $farmer, array $data): Farm
    {
        return DB::transaction(function () use ($farmer, $data) {
            $farm = $this->farms->create([
                'farmer_id' => $farmer->id,
                'farm_name' => $data['farm_name'],
                'municipality_id' => $data['municipality_id'],
                'barangay_id' => $data['barangay_id'],
                'address' => $data['address'] ?? null,
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'area_hectares' => $data['area_hectares'] ?? null,
                'farm_type' => $data['farm_type'],
                'primary_crop' => $data['primary_crop'] ?? null,
                'ownership_status' => $data['ownership_status'] ?? null,
                'status' => 'active',
            ]);

            if (! empty($data['boundary'])) {
                $farm->boundaries()->create([
                    'geojson' => $data['boundary'],
                    'computed_area_hectares' => $this->computePolygonArea($data['boundary']),
                ]);
            }

            return $farm->load('boundaries', 'municipality', 'barangay');
        });
    }

    public function update(Farm $farm, array $data): Farm
    {
        return $this->farms->update($farm, $data);
    }

    public function delete(Farm $farm): bool
    {
        return $this->farms->delete($farm);
    }

    public function attachBoundary(Farm $farm, array $geojson): void
    {
        $farm->boundaries()->create([
            'geojson' => $geojson,
            'computed_area_hectares' => $this->computePolygonArea($geojson),
        ]);
    }

    /**
     * Computes the approximate area (in hectares) of a GeoJSON polygon using
     * the spherical excess / shoelace formula on an equirectangular
     * projection — sufficiently accurate for farm-plot scale distances.
     */
    protected function computePolygonArea(array $geojson): ?float
    {
        $coordinates = $geojson['coordinates'][0] ?? null;

        if (! $coordinates || count($coordinates) < 3) {
            return null;
        }

        $earthRadius = 6378137; // meters
        $area = 0;
        $count = count($coordinates);

        for ($i = 0; $i < $count - 1; $i++) {
            [$lon1, $lat1] = $coordinates[$i];
            [$lon2, $lat2] = $coordinates[$i + 1];

            $area += deg2rad($lon2 - $lon1) * (2 + sin(deg2rad($lat1)) + sin(deg2rad($lat2)));
        }

        $area = abs($area * $earthRadius * $earthRadius / 2);

        return round($area / 10000, 2); // m² → hectares
    }
}
