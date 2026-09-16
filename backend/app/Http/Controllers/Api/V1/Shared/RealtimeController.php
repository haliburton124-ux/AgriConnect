<?php

namespace App\Http\Controllers\Api\V1\Shared;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RealtimeController extends Controller
{
    /** Lightweight inbox snapshot for live badge/chat updates. */
    public function snapshot(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $unreadMessages = Message::query()
            ->where('receiver_id', $userId)
            ->whereNull('read_at')
            ->count();

        $latestIncoming = Message::query()
            ->where('receiver_id', $userId)
            ->latest('id')
            ->first(['id', 'sender_id']);

        $latestMessageId = (int) Message::query()
            ->where(function ($q) use ($userId) {
                $q->where('sender_id', $userId)->orWhere('receiver_id', $userId);
            })
            ->max('id');

        $unreadNotifications = DB::table('notifications')
            ->where('notifiable_type', $request->user()->getMorphClass())
            ->where('notifiable_id', $userId)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'unread_messages' => $unreadMessages,
            'unread_notifications' => $unreadNotifications,
            'latest_message_id' => $latestMessageId,
            'sender_id' => $latestIncoming?->sender_id,
        ]);
    }
}
