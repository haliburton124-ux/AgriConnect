<?php

namespace App\Http\Requests\Document;

use App\Models\Document;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMunicipalityDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['municipal_office', 'provincial_office', 'admin']);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'category' => ['required', Rule::in(array_merge(
                Document::MUNICIPALITY_CATEGORIES,
                ['permit', 'report'],
            ))],
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf,doc,docx', 'max:10240'],
            'municipality_id' => ['nullable', 'exists:municipalities,id'],
        ];
    }
}
