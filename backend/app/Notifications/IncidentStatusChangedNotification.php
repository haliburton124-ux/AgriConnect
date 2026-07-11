<?php

namespace App\Notifications;

use App\Models\Incident;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class IncidentStatusChangedNotification extends Notification
{
    use Queueable;

    public function __construct(protected Incident $incident, protected string $newStatus)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Incident {$this->incident->reference_code} — Status Update")
            ->greeting("Hello {$notifiable->first_name},")
            ->line("Your incident report \"{$this->incident->title}\" is now marked as **{$this->newStatus}**.")
            ->action('View Incident', url("/incidents/{$this->incident->id}"))
            ->line('Thank you for using Agriri.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'incident_id' => $this->incident->id,
            'reference_code' => $this->incident->reference_code,
            'status' => $this->newStatus,
            'message' => "Incident {$this->incident->reference_code} is now {$this->newStatus}.",
        ];
    }
}
