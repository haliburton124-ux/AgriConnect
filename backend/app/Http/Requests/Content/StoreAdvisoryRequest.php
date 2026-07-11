<?php

namespace App\Http\Requests\Content;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdvisoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['municipal_office', 'provincial_office', 'admin']);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'content' => ['required', 'string', 'max:10000'],
            'type' => ['required', 'in:weather,pest,disease,market,general'],
            'severity' => ['required', 'in:info,advisory,warning,emergency'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:valid_from'],
            'is_published' => ['boolean'],
        ];
    }
}
