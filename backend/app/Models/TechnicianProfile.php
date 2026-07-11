<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TechnicianProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'license_number', 'specializations', 'assigned_municipality_id',
        'years_experience', 'availability', 'current_latitude', 'current_longitude',
    ];

    protected $casts = [
        'specializations' => 'array',
        'current_latitude' => 'decimal:7',
        'current_longitude' => 'decimal:7',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedMunicipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class, 'assigned_municipality_id');
    }
}
