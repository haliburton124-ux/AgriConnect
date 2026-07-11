<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'middle_name' => $this->middle_name,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'status' => $this->status,
            'avatar_url' => $this->avatar_path ? asset('storage/'.$this->avatar_path) : null,
            'municipality' => $this->whenLoaded('municipality', fn () => [
                'id' => $this->municipality->id,
                'name' => $this->municipality->name,
            ]),
            'barangay' => $this->whenLoaded('barangay', fn () => [
                'id' => $this->barangay->id,
                'name' => $this->barangay->name,
            ]),
            'two_factor_enabled' => $this->two_factor_enabled,
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
        ];
    }
}
