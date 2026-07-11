<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IncidentCategory extends Model
{
    protected $fillable = ['name', 'slug', 'icon', 'color', 'description', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function incidents(): HasMany
    {
        return $this->hasMany(Incident::class, 'category_id');
    }
}
