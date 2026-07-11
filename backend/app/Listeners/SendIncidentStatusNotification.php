<?php

namespace App\Listeners;

use App\Events\IncidentStatusChanged;
use App\Notifications\IncidentStatusChangedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendIncidentStatusNotification implements ShouldQueue
{
    public function handle(IncidentStatusChanged $event): void
    {
        $event->incident->farmer->notify(
            new IncidentStatusChangedNotification($event->incident, $event->toStatus)
        );
    }
}
