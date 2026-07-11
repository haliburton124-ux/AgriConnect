<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IncidentStatusHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'from_status' => $this->from_status,
            'to_status' => $this->to_status,
            'notes' => $this->notes,
            'changed_by' => $this->whenLoaded('changedBy', fn () => [
                'id' => $this->changedBy->id,
                'full_name' => $this->changedBy->full_name,
                'role' => $this->changedBy->role,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
