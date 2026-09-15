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
        return [
            'status' => ['required', 'in:confirmed,completed,cancelled,no_show'],
        ];
    }
}
