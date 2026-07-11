<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecommendationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'inspection_notes' => $this->inspection_notes,
            'treatment_recommendation' => $this->treatment_recommendation,
            'follow_up_actions' => $this->follow_up_actions,
            'requires_follow_up' => $this->requires_follow_up,
            'follow_up_date' => $this->follow_up_date,
            'attachments' => collect($this->attachment_paths ?? [])->map(fn ($p) => asset('storage/'.$p)),
            'technician' => $this->whenLoaded('technician', fn () => [
                'id' => $this->technician->id,
                'full_name' => $this->technician->full_name,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
