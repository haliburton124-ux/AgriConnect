<?php

namespace App\Listeners;

use App\Events\IncidentAssigned;
use App\Events\IncidentStatusChanged;
use App\Services\AuditLogger;

class LogAuditEvents
{
    public function __construct(protected AuditLogger $audit)
    {
    }

    public function handleStatusChanged(IncidentStatusChanged $event): void
    {
        $this->audit->logIncidentStatus($event->incident, $event->fromStatus, $event->toStatus);
    }

    public function handleAssigned(IncidentAssigned $event): void
    {
        $incident = $event->incident->loadMissing('assignedTechnician');
        $this->audit->logIncidentAssigned($incident, $incident->assigned_technician_id);
    }
}
