<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FarmBoundary extends Model
{
    protected $fillable = ['farm_id', 'geojson', 'computed_area_hectares'];

    protected $casts = [
        'geojson' => 'array',
        'computed_area_hectares' => 'decimal:2',
    ];

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }
}
