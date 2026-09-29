<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProfilePhoto extends Model
{
    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $fillable = ['user_id', 'mime', 'data'];

    protected $hidden = ['data'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
