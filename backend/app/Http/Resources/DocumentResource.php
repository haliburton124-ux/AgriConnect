<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'file_path' => $this->file_path,
            'mime_type' => $this->mime_type,
            'size_bytes' => $this->size_bytes,
            'category' => $this->category,
            'visibility' => $this->visibility ?? 'personal',
            'municipality' => $this->whenLoaded('municipality', fn () => [
                'id' => $this->municipality->id,
                'name' => $this->municipality->name,
            ]),
            'uploaded_by' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'full_name' => $this->user->full_name,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
