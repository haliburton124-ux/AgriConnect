<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IncidentAssignment extends Model
{
    protected $fillable = [
        'incident_id', 'technician_id', 'assigned_by', 'status',
        'assigned_at', 'completed_at',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function incident(): BelongsTo
    {
        return $this->belongsTo(Incident::class);
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
