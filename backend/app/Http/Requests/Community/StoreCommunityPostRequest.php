<?php

namespace App\Http\Requests\Community;

use App\Models\CommunityPost;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCommunityPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['municipal_office', 'provincial_office', 'admin']);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'content' => ['required', 'string', 'max:15000'],
            'category' => ['required', Rule::in(CommunityPost::CATEGORIES)],
            'is_published' => ['boolean'],
            'municipality_id' => ['nullable', 'exists:municipalities,id'],
        ];
    }
}
