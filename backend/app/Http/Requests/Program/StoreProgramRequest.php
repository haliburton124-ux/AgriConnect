<?php

namespace App\Http\Requests\Program;

use Illuminate\Foundation\Http\FormRequest;

class StoreProgramRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['provincial_office', 'admin']);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'description' => ['required', 'string'],
            'cover_image' => ['nullable', 'image', 'max:4096'],
            'category' => ['required', 'in:subsidy,training,loan,seedling,equipment,insurance,other'],
            'application_start' => ['nullable', 'date'],
            'application_end' => ['nullable', 'date', 'after_or_equal:application_start'],
            'eligibility_criteria' => ['nullable', 'array'],
            'is_active' => ['boolean'],
        ];
    }
}
