<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OtpNotification extends Notification
{
    use Queueable;

    public function __construct(protected string $otp)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Agriri — Your One-Time Verification Code')
            ->greeting("Hello {$notifiable->first_name},")
            ->line('Your one-time verification code is:')
            ->line("**{$this->otp}**")
            ->line('This code will expire in 10 minutes.')
            ->line('If you did not request this, please ignore this email.');
    }
}
