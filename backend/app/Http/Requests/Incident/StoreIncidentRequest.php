<?php

namespace App\Http\Requests\Incident;

use App\Models\Farm;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreIncidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('farmer');
    }

    public function rules(): array
    {
        return [
            'farm_id' => ['required', 'exists:farms,id'],
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

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $farmer = $this->user();

            $hasGeolocatedFarm = $farmer->farms()
                ->whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->where('latitude', '!=', 0)
                ->where('longitude', '!=', 0)
                ->exists();

            if (! $hasGeolocatedFarm) {
                $validator->errors()->add(
                    'farm_id',
                    'You must register at least one farm with a valid GPS location before reporting incidents.'
                );

                return;
            }

            $farmId = $this->input('farm_id');
            if (! $farmId) {
                return;
            }

            /** @var Farm|null $farm */
            $farm = $farmer->farms()->find($farmId);

            if (! $farm) {
                $validator->errors()->add('farm_id', 'The selected farm does not belong to your account.');

                return;
            }

            if (! $this->farmHasValidLocation($farm)) {
                $validator->errors()->add('farm_id', 'The selected farm does not have a valid GPS location.');
            }
        });
    }

    protected function farmHasValidLocation(Farm $farm): bool
    {
        return is_numeric($farm->latitude)
            && is_numeric($farm->longitude)
            && (float) $farm->latitude !== 0.0
            && (float) $farm->longitude !== 0.0;
    }

    public function messages(): array
    {
        return [
            'farm_id.required' => 'Select the farm where this incident occurred.',
            'photos.*.max' => 'Each photo must not exceed 8MB.',
            'videos.*.max' => 'Each video must not exceed 50MB.',
            'incident_date.before_or_equal' => 'Incident date cannot be in the future.',
        ];
    }
}
