<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:20'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            // Public registration is restricted to farmers. Staff accounts
            // (technician/municipal_office/provincial_office/admin) are
            // provisioned by an Admin via the internal user management module.
            'municipality_id' => ['required', 'exists:municipalities,id'],
            'barangay_id' => ['required', 'exists:barangays,id'],
        ];
    }
}
