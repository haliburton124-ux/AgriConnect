<?php

namespace App\Http\Requests\Farm;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFarmRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->id === $this->route('farm')->farmer_id;
    }

    public function rules(): array
    {
        return [
            'farm_name' => ['sometimes', 'string', 'max:150'],
            'municipality_id' => ['sometimes', 'exists:municipalities,id'],
            'barangay_id' => ['sometimes', 'exists:barangays,id'],
            'address' => ['nullable', 'string', 'max:500'],
            'latitude' => ['sometimes', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'numeric', 'between:-180,180'],
            'area_hectares' => ['nullable', 'numeric', 'min:0'],
            'farm_type' => ['sometimes', 'in:rice,corn,vegetable,fruit,livestock,poultry,fishery,mixed,other'],
            'primary_crop' => ['nullable', 'string', 'max:100'],
            'ownership_status' => ['nullable', 'in:owned,leased,tenant,other'],
            'status' => ['sometimes', 'in:active,inactive'],
        ];
    }
}
