<?php

namespace App\Http\Requests\Report;

use Illuminate\Foundation\Http\FormRequest;

class ExportReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['municipal_office', 'provincial_office', 'admin']);
    }

    public function rules(): array
    {
        return [
            'format' => ['required', 'in:csv,xlsx,pdf'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            // Only Provincial Office / Admin may target a specific municipality
            // other than their own — enforced in the controller.
            'municipality_id' => ['nullable', 'exists:municipalities,id'],
        ];
    }
}
