<?php

namespace App\Http\Requests\Appointment;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAppointmentStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('technician') ?? false;
    }

    public function rules(): array
    {
        $completing = $this->input('status') === 'completed';

        return [
            'status' => ['required', 'in:confirmed,completed,cancelled,no_show'],
            'completion_findings' => [$completing ? 'required' : 'nullable', 'string', 'min:10', 'max:5000'],
            'completion_outcome' => [$completing ? 'required' : 'nullable', 'string', 'min:10', 'max:5000'],
            'completion_follow_up' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
