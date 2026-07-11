<?php

namespace App\Http\Requests\Content;

use Illuminate\Foundation\Http\FormRequest;

class StoreAnnouncementRequest extends FormRequest
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
            'cover_image' => ['nullable', 'image', 'max:4096'],
            'audience' => ['required', 'in:all,farmers,technicians,municipal_office'],
            'is_published' => ['boolean'],
        ];
    }
}
