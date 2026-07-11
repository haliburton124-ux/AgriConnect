<?php

namespace App\Services;

use Google\Client as GoogleClient;
use Google\Service\Gmail;
use Google\Service\Gmail\Message;

/**
 * Sends email through the Gmail API over HTTPS (port 443).
 * Railway blocks outbound SMTP (587/465), so this is the reliable way
 * to deliver OTP messages from a personal Gmail account.
 */
class GmailApiService
{
    public function isConfigured(): bool
    {
        return (bool) (
            config('services.gmail.client_id')
            && config('services.gmail.client_secret')
            && config('services.gmail.refresh_token')
        );
    }

    public function send(string $to, string $subject, string $htmlBody): void
    {
        if (! $this->isConfigured()) {
            throw new \RuntimeException('Gmail API is not configured.');
        }

        $client = new GoogleClient();
        $client->setClientId(config('services.gmail.client_id'));
        $client->setClientSecret(config('services.gmail.client_secret'));
        $client->setAccessType('offline');
        $client->fetchAccessTokenWithRefreshToken(config('services.gmail.refresh_token'));

        $service = new Gmail($client);
        $from = config('services.gmail.sender', config('mail.from.address'));

        $raw = implode("\r\n", [
            "From: {$from}",
            "To: {$to}",
            "Subject: {$subject}",
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=utf-8',
            '',
            $htmlBody,
        ]);

        $message = new Message();
        $message->setRaw(rtrim(strtr(base64_encode($raw), '+/', '-_'), '='));

        $service->users_messages->send('me', $message);
    }
}
