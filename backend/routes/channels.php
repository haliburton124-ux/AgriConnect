<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
| Private channels used for real-time incident tracking (Laravel Echo +
| Pusher/Reverb on the frontend). Each channel is scoped so users only
| receive events relevant to them.
*/

Broadcast::channel('farmer.{farmerId}', function ($user, int $farmerId) {
    return (int) $user->id === $farmerId;
});

Broadcast::channel('technician.{technicianId}', function ($user, int $technicianId) {
    return (int) $user->id === $technicianId;
});

Broadcast::channel('incident.{incidentId}', function ($user, int $incidentId) {
    $incident = \App\Models\Incident::find($incidentId);

    if (! $incident) {
        return false;
    }

    return $user->id === $incident->farmer_id
        || $user->id === $incident->assigned_technician_id
        || $user->hasRole(['municipal_office', 'provincial_office', 'admin']);
});

Broadcast::channel('municipality.{municipalityId}', function ($user, int $municipalityId) {
    return $user->hasRole(['municipal_office', 'admin']) && (int) $user->municipality_id === $municipalityId;
});
