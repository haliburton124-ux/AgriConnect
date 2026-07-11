<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:active,inactive,suspended'],
            'reason' => ['nullable', 'string', 'max:500'],
        ];
    }
}
