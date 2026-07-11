<?php

namespace App\Notifications;

use App\Models\Incident;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class IncidentAssignedNotification extends Notification
{
    use Queueable;

    public function __construct(protected Incident $incident)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("New Incident Assigned — {$this->incident->reference_code}")
            ->greeting("Hello {$notifiable->first_name},")
            ->line("You have been assigned to inspect: \"{$this->incident->title}\"")
            ->line("Location: Brgy. {$this->incident->barangay->name}, {$this->incident->municipality->name}")
            ->action('View Incident', url("/technician/incidents/{$this->incident->id}"))
            ->line('Please schedule an inspection visit as soon as possible.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'incident_id' => $this->incident->id,
            'reference_code' => $this->incident->reference_code,
            'message' => "New incident assigned: {$this->incident->title}",
        ];
    }
}
