<?php

namespace App\Http\Requests\Message;

use App\Http\Controllers\Api\V1\Shared\MessageController;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

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

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $user = $this->user();
            $receiverId = (int) $this->input('receiver_id');
            if (! $user || $receiverId < 1) {
                return;
            }

            $allowed = MessageController::assignedContactIdsFor($user);
            $alreadyChatting = \App\Models\Message::query()
                ->where(function ($q) use ($user, $receiverId) {
                    $q->where(function ($inner) use ($user, $receiverId) {
                        $inner->where('sender_id', $user->id)->where('receiver_id', $receiverId);
                    })->orWhere(function ($inner) use ($user, $receiverId) {
                        $inner->where('sender_id', $receiverId)->where('receiver_id', $user->id);
                    });
                })
                ->exists();

            if (! $allowed->contains($receiverId) && ! $alreadyChatting) {
                $validator->errors()->add('receiver_id', 'You can only message your assigned contact.');
            }
        });
    }
}
