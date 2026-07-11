<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreStaffUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:20'],
            'password' => ['required', Password::min(8)->mixedCase()->numbers()],
            'role' => ['required', 'in:provincial_office,municipal_office,technician,admin'],
            'municipality_id' => ['required_if:role,municipal_office,technician', 'nullable', 'exists:municipalities,id'],
            'barangay_id' => ['nullable', 'exists:barangays,id'],
            // Technician-specific fields
            'license_number' => ['required_if:role,technician', 'nullable', 'string', 'max:100'],
            'specializations' => ['nullable', 'array'],
        ];
    }
}
