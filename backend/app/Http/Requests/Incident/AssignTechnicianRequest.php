<?php

namespace App\Http\Requests\Incident;

use Illuminate\Foundation\Http\FormRequest;

class AssignTechnicianRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['municipal_office', 'admin']);
    }

    public function rules(): array
    {
        return [
            'technician_id' => ['required', 'exists:users,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
