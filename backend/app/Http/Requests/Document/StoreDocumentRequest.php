<?php

namespace App\Http\Requests\Document;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'category' => ['required', 'in:land_title,certification,id,permit,other'],
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:8192'],
        ];
    }
}
