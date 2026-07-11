<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Incident extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_PENDING = 'pending';
    public const STATUS_VALIDATED = 'validated';
    public const STATUS_ASSIGNED = 'assigned';
    public const STATUS_ONGOING = 'ongoing';
    public const STATUS_RESOLVED = 'resolved';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'reference_code', 'farmer_id', 'farm_id', 'category_id', 'municipality_id',
        'barangay_id', 'title', 'description', 'severity', 'latitude', 'longitude',
        'incident_date', 'remarks', 'status', 'assigned_technician_id',
        'validated_by', 'validated_at', 'resolved_at', 'rejection_reason',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'incident_date' => 'date',
        'validated_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public function farmer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'farmer_id');
    }

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(IncidentCategory::class, 'category_id');
    }

    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class);
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function assignedTechnician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_technician_id');
    }

    public function validator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    public function media(): HasMany
    {
        return $this->hasMany(IncidentMedia::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(IncidentStatusHistory::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(IncidentAssignment::class);
    }

    public function recommendations(): HasMany
    {
        return $this->hasMany(Recommendation::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
}
