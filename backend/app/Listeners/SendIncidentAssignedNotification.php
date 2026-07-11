<?php

namespace App\Listeners;

use App\Events\IncidentAssigned;
use App\Notifications\IncidentAssignedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendIncidentAssignedNotification implements ShouldQueue
{
    public function handle(IncidentAssigned $event): void
    {
        $incident = $event->incident->loadMissing('assignedTechnician', 'barangay', 'municipality');

        $incident->assignedTechnician?->notify(new IncidentAssignedNotification($incident));
    }
}
