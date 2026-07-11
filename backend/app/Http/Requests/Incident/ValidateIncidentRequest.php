<?php

namespace App\Http\Requests\Incident;

use Illuminate\Foundation\Http\FormRequest;

class ValidateIncidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['municipal_office', 'admin']);
    }

    public function rules(): array
    {
        return [
            'remarks' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
