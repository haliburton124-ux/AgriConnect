<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IncidentMedia extends Model
{
    protected $fillable = ['incident_id', 'type', 'path', 'mime_type', 'size_bytes'];

    public function incident(): BelongsTo
    {
        return $this->belongsTo(Incident::class);
    }
}
