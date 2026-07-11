<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Recommendation extends Model
{
    protected $fillable = [
        'incident_id', 'technician_id', 'inspection_notes', 'treatment_recommendation',
        'follow_up_actions', 'attachment_paths', 'requires_follow_up', 'follow_up_date',
    ];

    protected $casts = [
        'attachment_paths' => 'array',
        'requires_follow_up' => 'boolean',
        'follow_up_date' => 'date',
    ];

    public function incident(): BelongsTo
    {
        return $this->belongsTo(Incident::class);
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }
}
