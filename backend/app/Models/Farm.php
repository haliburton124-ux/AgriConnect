<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Farm extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'farmer_id', 'farm_name', 'municipality_id', 'barangay_id', 'address',
        'latitude', 'longitude', 'area_hectares', 'farm_type', 'primary_crop',
        'ownership_status', 'status',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'area_hectares' => 'decimal:2',
    ];

    public function farmer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'farmer_id');
    }

    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class);
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function boundaries(): HasMany
    {
        return $this->hasMany(FarmBoundary::class);
    }

    public function incidents(): HasMany
    {
        return $this->hasMany(Incident::class);
    }
}
