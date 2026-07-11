<?php

namespace App\Http\Requests\Incident;

use Illuminate\Foundation\Http\FormRequest;

class StoreRecommendationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('technician');
    }

    public function rules(): array
    {
        return [
            'inspection_notes' => ['required', 'string', 'max:5000'],
            'treatment_recommendation' => ['required', 'string', 'max:5000'],
            'follow_up_actions' => ['nullable', 'string', 'max:2000'],
            'requires_follow_up' => ['boolean'],
            'follow_up_date' => ['required_if:requires_follow_up,true', 'date', 'after:today'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => ['file', 'mimes:jpg,jpeg,png,pdf', 'max:8192'],
        ];
    }
}
