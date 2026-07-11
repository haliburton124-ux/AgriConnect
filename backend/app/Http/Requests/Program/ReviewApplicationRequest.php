<?php

namespace App\Http\Requests\Program;

use Illuminate\Foundation\Http\FormRequest;

class ReviewApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['municipal_office', 'provincial_office', 'admin']);
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:under_review,approved,rejected'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
