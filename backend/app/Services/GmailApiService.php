<?php

namespace App\Services;

use Google\Client as GoogleClient;
use Google\Service\Gmail;
use Google\Service\Gmail\Message;
use RuntimeException;

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
            throw new RuntimeException('Gmail API is not configured.');
        }

        $client = new GoogleClient();
        $client->setClientId(config('services.gmail.client_id'));
        $client->setClientSecret(config('services.gmail.client_secret'));
        $client->setRedirectUri(config('services.gmail.redirect_uri'));
        $client->setAccessType('offline');

        $token = $client->fetchAccessTokenWithRefreshToken(config('services.gmail.refresh_token'));

        if (! is_array($token) || isset($token['error'])) {
            $message = is_array($token)
                ? ($token['error_description'] ?? $token['error'] ?? 'Unknown OAuth error')
                : 'Invalid OAuth token response';

            throw new RuntimeException("Gmail OAuth refresh failed: {$message}");
        }

        $service = new Gmail($client);

        $raw = implode("\r\n", [
            'From: '.$this->formatFromAddress(),
            "To: {$to}",
            'Subject: '.$this->encodeHeader($subject),
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=utf-8',
            'Content-Transfer-Encoding: base64',
            '',
            base64_encode($htmlBody),
        ]);

        $message = new Message();
        $message->setRaw(rtrim(strtr(base64_encode($raw), '+/', '-_'), '='));

        $service->users_messages->send('me', $message);
    }

    protected function formatFromAddress(): string
    {
        $address = config('services.gmail.sender', config('mail.from.address'));
        $name = trim((string) config('services.gmail.sender_name', config('mail.from.name', 'AgriConnect-IN')));

        if ($name === '') {
            return $address;
        }

        $escapedName = str_replace(['\\', '"'], ['\\\\', '\\"'], $name);

        return "\"{$escapedName}\" <{$address}>";
    }

    protected function encodeHeader(string $value): string
    {
        if (preg_match('/[^\x20-\x7E]/', $value)) {
            return '=?UTF-8?B?'.base64_encode($value).'?=';
        }

        return $value;
    }
}
