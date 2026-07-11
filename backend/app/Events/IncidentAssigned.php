<?php

namespace App\Events;

use App\Models\Incident;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class IncidentAssigned
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Incident $incident)
    {
    }
}
