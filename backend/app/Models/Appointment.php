<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    protected $fillable = [
        'incident_id', 'farmer_id', 'technician_id', 'farm_id',
        'scheduled_at', 'purpose', 'notes', 'status',
    ];

    protected $casts = ['scheduled_at' => 'datetime'];

    public function incident(): BelongsTo
    {
        return $this->belongsTo(Incident::class);
    }

    public function farmer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'farmer_id');
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }
}
