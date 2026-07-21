<?php

namespace App\Console\Commands;

use App\Services\GmailApiService;
use Illuminate\Console\Command;

class TestGmailCommand extends Command
{
    protected $signature = 'mail:test-gmail {email : Recipient email address}';

    protected $description = 'Send a test email through the Gmail API (for Railway debugging)';

    public function handle(GmailApiService $gmail): int
    {
        if (! $gmail->isConfigured()) {
            $this->error('Gmail API is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN.');

            return self::FAILURE;
        }

        $recipient = $this->argument('email');

        try {
            $gmail->send(
                $recipient,
                'AgriConnect-IN - Gmail API Test',
                '<p>If you received this, Gmail API delivery is working on this server.</p>',
            );

            $this->info("Test email sent to {$recipient}.");

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Gmail API send failed: '.$e->getMessage());

            return self::FAILURE;
        }
    }
}
