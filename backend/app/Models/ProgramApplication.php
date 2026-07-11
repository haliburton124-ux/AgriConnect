<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgramApplication extends Model
{
    protected $fillable = ['program_id', 'farmer_id', 'status', 'remarks', 'document_paths'];

    protected $casts = ['document_paths' => 'array'];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function farmer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'farmer_id');
    }
}
