<?php

namespace App\Events;

use App\Models\Incident;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class IncidentStatusChanged
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Incident $incident,
        public string $fromStatus,
        public string $toStatus,
    ) {
    }
}
