<?php

namespace App\Http\Requests\Community;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommunityPostCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:2000'],
            'parent_id' => ['nullable', 'exists:community_post_comments,id'],
        ];
    }
}
