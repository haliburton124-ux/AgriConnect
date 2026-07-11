<?php

namespace App\Http\Requests\Knowledge;

use Illuminate\Foundation\Http\FormRequest;

class StoreKnowledgeArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['municipal_office', 'provincial_office', 'admin']);
    }

    public function rules(): array
    {
        return [
            'category_id' => ['nullable', 'exists:knowledge_categories,id'],
            'title' => ['required', 'string', 'max:200'],
            'content' => ['required', 'string'],
            'cover_image' => ['nullable', 'image', 'max:4096'],
            'type' => ['required', 'in:article,video,faq,pdf_guide'],
            'video_url' => ['required_if:type,video', 'nullable', 'url'],
            'pdf_file' => ['required_if:type,pdf_guide', 'nullable', 'file', 'mimes:pdf', 'max:10240'],
            'is_published' => ['boolean'],
        ];
    }
}
