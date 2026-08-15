<?php

namespace App\Http\Requests\Community;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommunityPostCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('body') && trim((string) $this->input('body')) === '') {
            $this->merge(['body' => null]);
        }
    }

    public function rules(): array
    {
        return [
            'body' => ['nullable', 'string', 'max:2000'],
            'image' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp,gif', 'max:10240'],
            'parent_id' => ['nullable', 'exists:community_post_comments,id'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if (! trim((string) $this->input('body', '')) && ! $this->hasFile('image')) {
                $validator->errors()->add('body', 'Write a comment or attach a photo.');
            }
        });
    }
}
