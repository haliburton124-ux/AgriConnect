<?php

namespace App\Jobs;

use App\Models\DeviceToken;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Sends a push notification via Firebase Cloud Messaging (HTTP v1 API) to
 * every device token registered for the given user. Failures for individual
 * (e.g. expired) tokens are logged and pruned rather than failing the job.
 */
class SendPushNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        public int $userId,
        public string $title,
        public string $body,
        public array $data = [],
    ) {
    }

    public function handle(): void
    {
        $tokens = DeviceToken::where('user_id', $this->userId)->get();

        if ($tokens->isEmpty()) {
            return;
        }

        $accessToken = $this->getFcmAccessToken();
        $projectId = config('services.firebase.project_id');

        foreach ($tokens as $deviceToken) {
            $response = Http::withToken($accessToken)->post(
                "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send",
                [
                    'message' => [
                        'token' => $deviceToken->fcm_token,
                        'notification' => [
                            'title' => $this->title,
                            'body' => $this->body,
                        ],
                        'data' => array_map('strval', $this->data),
                    ],
                ]
            );

            if ($response->failed() && $response->status() === 404) {
                // Token no longer valid (app uninstalled, etc.) — prune it.
                $deviceToken->delete();
            } elseif ($response->failed()) {
                Log::warning('FCM push notification failed', [
                    'user_id' => $this->userId,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        }
    }

    protected function getFcmAccessToken(): string
    {
        // In production this uses the Google API client with the service
        // account credentials at config('services.firebase.credentials')
        // to mint a short-lived OAuth2 access token, cached for ~55 minutes.
        return cache()->remember('fcm_access_token', 3300, function () {
            $credentialsPath = config('services.firebase.credentials');

            $client = new \Google\Client();
            $client->setAuthConfig($credentialsPath);
            $client->addScope('https://www.googleapis.com/auth/firebase.messaging');

            return $client->fetchAccessTokenWithAssertion()['access_token'];
        });
    }
}
