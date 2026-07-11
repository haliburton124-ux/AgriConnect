<?php

namespace App\Http\Requests\Program;

use Illuminate\Foundation\Http\FormRequest;

class ApplyProgramRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('farmer');
    }

    public function rules(): array
    {
        return [
            'remarks' => ['nullable', 'string', 'max:1000'],
            'documents' => ['nullable', 'array', 'max:5'],
            'documents.*' => ['file', 'mimes:jpg,jpeg,png,pdf', 'max:8192'],
        ];
    }
}
