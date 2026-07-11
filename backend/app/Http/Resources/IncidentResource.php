<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IncidentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference_code' => $this->reference_code,
            'title' => $this->title,
            'description' => $this->description,
            'severity' => $this->severity,
            'status' => $this->status,
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
            'incident_date' => $this->incident_date?->format('Y-m-d'),
            'remarks' => $this->remarks,
            'rejection_reason' => $this->rejection_reason,

            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'icon' => $this->category->icon,
                'color' => $this->category->color,
            ]),
            'farmer' => $this->whenLoaded('farmer', fn () => [
                'id' => $this->farmer->id,
                'full_name' => $this->farmer->full_name,
                'phone' => $this->farmer->phone,
            ]),
            'farm' => $this->whenLoaded('farm', fn () => $this->farm ? [
                'id' => $this->farm->id,
                'farm_name' => $this->farm->farm_name,
            ] : null),
            'municipality' => $this->whenLoaded('municipality', fn () => ['id' => $this->municipality->id, 'name' => $this->municipality->name]),
            'barangay' => $this->whenLoaded('barangay', fn () => ['id' => $this->barangay->id, 'name' => $this->barangay->name]),
            'assigned_technician' => $this->whenLoaded('assignedTechnician', fn () => $this->assignedTechnician ? [
                'id' => $this->assignedTechnician->id,
                'full_name' => $this->assignedTechnician->full_name,
                'phone' => $this->assignedTechnician->phone,
            ] : null),

            'media' => IncidentMediaResource::collection($this->whenLoaded('media')),
            'status_history' => IncidentStatusHistoryResource::collection($this->whenLoaded('statusHistories')),
            'recommendations' => RecommendationResource::collection($this->whenLoaded('recommendations')),

            'validated_at' => $this->validated_at,
            'resolved_at' => $this->resolved_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
