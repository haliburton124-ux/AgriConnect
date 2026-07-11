<?php

namespace App\Http\Requests\Incident;

use Illuminate\Foundation\Http\FormRequest;

class UpdateIncidentStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['technician', 'municipal_office', 'admin']);
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:ongoing,resolved'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
