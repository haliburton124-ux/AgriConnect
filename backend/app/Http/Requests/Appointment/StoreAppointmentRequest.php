<?php

namespace App\Http\Requests\Appointment;

use Illuminate\Foundation\Http\FormRequest;

class StoreAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['farmer', 'technician']);
    }

    public function rules(): array
    {
        $user = $this->user();

        return [
            'incident_id' => ['nullable', 'exists:incidents,id'],
            'farm_id' => ['nullable', 'exists:farms,id'],
            // A farmer booking must specify which technician; a technician
            // booking must specify which farmer.
            'technician_id' => [$user?->hasRole('farmer') ? 'required' : 'nullable', 'exists:users,id'],
            'farmer_id' => [$user?->hasRole('technician') ? 'required' : 'nullable', 'exists:users,id'],
            'scheduled_at' => ['required', 'date', 'after:now'],
            'purpose' => ['nullable', 'string', 'max:200'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
