<?php

namespace App\Policies;

use App\Models\Incident;
use App\Models\User;

class IncidentPolicy
{
    public function view(User $user, Incident $incident): bool
    {
        return match ($user->role) {
            'admin', 'provincial_office' => true,
            'municipal_office' => $incident->municipality_id === $user->municipality_id,
            'technician' => $incident->assigned_technician_id === $user->id,
            'farmer' => $incident->farmer_id === $user->id,
            default => false,
        };
    }

    public function validateIncident(User $user, Incident $incident): bool
    {
        return $user->hasRole(['municipal_office', 'admin'])
            && $incident->municipality_id === $user->municipality_id
            && $incident->status === Incident::STATUS_PENDING;
    }

    public function reject(User $user, Incident $incident): bool
    {
        return $user->hasRole(['municipal_office', 'admin'])
            && $incident->municipality_id === $user->municipality_id
            && in_array($incident->status, [Incident::STATUS_PENDING, Incident::STATUS_VALIDATED], true);
    }

    public function assignTechnician(User $user, Incident $incident): bool
    {
        return $user->hasRole(['municipal_office', 'admin'])
            && $incident->municipality_id === $user->municipality_id
            && $incident->status === Incident::STATUS_VALIDATED;
    }

    public function updateStatus(User $user, Incident $incident): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('technician') && $incident->assigned_technician_id === $user->id;
    }

    public function addRecommendation(User $user, Incident $incident): bool
    {
        return $user->hasRole('technician') && $incident->assigned_technician_id === $user->id;
    }
}
