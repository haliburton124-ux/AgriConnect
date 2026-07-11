<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Municipality extends Model
{
    use HasFactory;

    protected $fillable = [
        'province_id', 'name', 'psgc_code', 'type',
        'latitude', 'longitude', 'boundary_geojson',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'boundary_geojson' => 'array',
    ];

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    public function barangays(): HasMany
    {
        return $this->hasMany(Barangay::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function incidents(): HasMany
    {
        return $this->hasMany(Incident::class);
    }
}
