<?php

namespace App\Http\Requests\Incident;

use Illuminate\Foundation\Http\FormRequest;

class StoreIncidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('farmer');
    }

    public function rules(): array
    {
        return [
            'farm_id' => ['nullable', 'exists:farms,id'],
            'category_id' => ['required', 'exists:incident_categories,id'],
            'title' => ['required', 'string', 'max:200'],
            'description' => ['required', 'string', 'max:5000'],
            'severity' => ['required', 'in:low,medium,high,critical'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'municipality_id' => ['required', 'exists:municipalities,id'],
            'barangay_id' => ['required', 'exists:barangays,id'],
            'incident_date' => ['required', 'date', 'before_or_equal:today'],
            'remarks' => ['nullable', 'string', 'max:2000'],
            'photos' => ['nullable', 'array', 'max:6'],
            'photos.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:8192'], // 8MB each
            'videos' => ['nullable', 'array', 'max:2'],
            'videos.*' => ['mimetypes:video/mp4,video/quicktime', 'max:51200'], // 50MB each
        ];
    }

    public function messages(): array
    {
        return [
            'photos.*.max' => 'Each photo must not exceed 8MB.',
            'videos.*.max' => 'Each video must not exceed 50MB.',
            'incident_date.before_or_equal' => 'Incident date cannot be in the future.',
        ];
    }
}
