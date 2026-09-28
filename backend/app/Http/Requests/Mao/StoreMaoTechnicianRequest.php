<?php

namespace App\Http\Requests\Mao;

use App\Models\Barangay;
use App\Support\PhilippinePhone;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreMaoTechnicianRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user?->hasRole('municipal_office') && (bool) $user->municipality_id;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('phone')) {
            $this->merge([
                'phone' => PhilippinePhone::normalize($this->input('phone')),
            ]);
        }
    }

    public function rules(): array
    {
        $municipalityId = $this->user()?->municipality_id;

        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
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
            'password' => ['required', Password::min(8)->mixedCase()->numbers()],
            'barangay_id' => [
                'required',
                'exists:barangays,id',
                function (string $attribute, mixed $value, Closure $fail) use ($municipalityId): void {
                    $matches = Barangay::query()
                        ->where('id', $value)
                        ->where('municipality_id', $municipalityId)
                        ->exists();

                    if (! $matches) {
                        $fail('Select a barangay in your municipality.');
                    }
                },
            ],
            'license_number' => ['nullable', 'string', 'max:100'],
            'specializations' => ['nullable', 'array'],
            'specializations.*' => ['string', 'max:50'],
        ];
    }
}
