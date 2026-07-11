<?php

namespace App\Http\Requests\Incident;

use Illuminate\Foundation\Http\FormRequest;

class RejectIncidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['municipal_office', 'admin']);
    }

    public function rules(): array
    {
        return [
            'rejection_reason' => ['required', 'string', 'max:2000'],
        ];
    }
}
