<?php

namespace App\Http\Requests\Farm;

use Illuminate\Foundation\Http\FormRequest;

class StoreFarmRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('farmer');
    }

    public function rules(): array
    {
        return [
            'farm_name' => ['required', 'string', 'max:150'],
            'municipality_id' => ['required', 'exists:municipalities,id'],
            'barangay_id' => ['required', 'exists:barangays,id'],
            'address' => ['nullable', 'string', 'max:500'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'area_hectares' => ['nullable', 'numeric', 'min:0'],
            'farm_type' => ['required', 'in:rice,corn,vegetable,fruit,livestock,poultry,fishery,mixed,other'],
            'primary_crop' => ['nullable', 'string', 'max:100'],
            'ownership_status' => ['nullable', 'in:owned,leased,tenant,other'],
            // Optional GeoJSON polygon drawn via Leaflet Draw on the frontend
            'boundary' => ['nullable', 'array'],
            'boundary.type' => ['required_with:boundary', 'in:Polygon'],
            'boundary.coordinates' => ['required_with:boundary', 'array'],
        ];
    }
}
