<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FarmResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'farm_name' => $this->farm_name,
            'address' => $this->address,
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
            'municipality_id' => $this->municipality_id,
            'barangay_id' => $this->barangay_id,
            'area_hectares' => $this->area_hectares ? (float) $this->area_hectares : null,
            'farm_type' => $this->farm_type,
            'primary_crop' => $this->primary_crop,
            'ownership_status' => $this->ownership_status,
            'status' => $this->status,
            'municipality' => $this->municipality
                ? ['id' => $this->municipality->id, 'name' => $this->municipality->name]
                : null,
            'barangay' => $this->barangay
                ? ['id' => $this->barangay->id, 'name' => $this->barangay->name]
                : null,
            'boundaries' => $this->whenLoaded('boundaries', fn () => $this->boundaries->map(fn ($b) => [
                'id' => $b->id,
                'geojson' => $b->geojson,
                'computed_area_hectares' => $b->computed_area_hectares ? (float) $b->computed_area_hectares : null,
            ])),
            'created_at' => $this->created_at,
        ];
    }
}
