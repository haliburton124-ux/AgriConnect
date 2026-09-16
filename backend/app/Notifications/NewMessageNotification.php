<?php

namespace App\Notifications;

use App\Models\Message;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification
{
    use Queueable;

    public function __construct(protected Message $message, protected User $sender)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $preview = mb_strimwidth(trim($this->message->body), 0, 80, '…');

        return [
            'activity_type' => 'message',
            'sender_id' => $this->sender->id,
            'actor_id' => $this->sender->id,
            'actor_name' => $this->sender->full_name,
            'message' => "{$this->sender->full_name} sent you a message: \"{$preview}\"",
        ];
    }
}
