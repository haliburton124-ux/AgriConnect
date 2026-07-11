<?php

namespace App\Http\Requests\Message;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['farmer', 'technician']);
    }

    public function rules(): array
    {
        return [
            'receiver_id' => ['required', 'exists:users,id'],
            'incident_id' => ['nullable', 'exists:incidents,id'],
            'body' => ['required', 'string', 'max:2000'],
            'attachment' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:8192'],
        ];
    }
}
