<?php

namespace App\Http\Requests\Appointment;

use App\Models\Incident;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Validator;

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

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $user = $this->user();
            if (! $user?->hasRole('farmer')) {
                return;
            }

            $technicianId = (int) $this->input('technician_id');
            if ($technicianId < 1) {
                return;
            }

            $technician = User::query()->where('id', $technicianId)->where('role', 'technician')->first();
            if (! $technician) {
                $validator->errors()->add('technician_id', 'Select a valid technician.');

                return;
            }

            $assignedOnIncident = Incident::query()
                ->where('farmer_id', $user->id)
                ->where('assigned_technician_id', $technicianId)
                ->exists();

            $assignedOnRecord = DB::table('incident_assignments')
                ->join('incidents', 'incidents.id', '=', 'incident_assignments.incident_id')
                ->where('incidents.farmer_id', $user->id)
                ->where('incident_assignments.technician_id', $technicianId)
                ->exists();

            if (! $assignedOnIncident && ! $assignedOnRecord) {
                $validator->errors()->add('technician_id', 'You can only schedule a visit with your assigned technician.');
            }
        });
    }
}
