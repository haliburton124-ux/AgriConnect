<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use App\Support\PhilippinePhone;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('phone')) {
            $this->merge([
                'phone' => PhilippinePhone::normalize($this->input('phone')),
            ]);
        }

        if ($this->has('suffix') && in_array($this->input('suffix'), [null, '', 'none'], true)) {
            $this->merge(['suffix' => null]);
        }
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'suffix' => ['nullable', 'string', Rule::in(PhilippinePhone::ALLOWED_SUFFIXES)],
            'email' => [
                'required',
                'email',
                'max:255',
                function (string $attribute, mixed $value, Closure $fail): void {
                    $user = User::where('email', $value)->first();

                    if ($user?->hasVerifiedEmail()) {
                        $fail('This email is already registered. Please sign in instead.');
                    }
                },
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                function (string $attribute, mixed $value, Closure $fail): void {
                    if (! PhilippinePhone::isValid($value)) {
                        $fail('Enter a valid Philippine mobile number (+63 9XXXXXXXXX).');
                    }
                },
            ],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'municipality_id' => ['required', 'exists:municipalities,id'],
            'barangay_id' => ['required', 'exists:barangays,id'],
        ];
    }
}
