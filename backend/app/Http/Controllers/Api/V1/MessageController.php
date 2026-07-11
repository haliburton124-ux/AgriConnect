<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Message\StoreMessageRequest;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    /**
     * Returns the requester's conversation list: one row per counterpart,
     * with the most recent message and unread count — powers a chat-list UI.
     */
    public function conversations(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $counterpartIds = Message::where('sender_id', $userId)->pluck('receiver_id')
            ->merge(Message::where('receiver_id', $userId)->pluck('sender_id'))
            ->unique()
            ->values();

        $conversations = $counterpartIds->map(function ($otherId) use ($userId) {
            $lastMessage = Message::where(function ($q) use ($userId, $otherId) {
                $q->where('sender_id', $userId)->where('receiver_id', $otherId);
            })->orWhere(function ($q) use ($userId, $otherId) {
                $q->where('sender_id', $otherId)->where('receiver_id', $userId);
            })->latest()->first();

            $unread = Message::where('sender_id', $otherId)->where('receiver_id', $userId)->whereNull('read_at')->count();
            $counterpart = User::find($otherId, ['id', 'first_name', 'last_name', 'role', 'avatar_path']);

            return [
                'counterpart' => $counterpart,
                'last_message' => $lastMessage,
                'unread_count' => $unread,
            ];
        })->sortByDesc(fn ($c) => $c['last_message']?->created_at)->values();

        return response()->json(['data' => $conversations]);
    }

    /** Full thread with a specific counterpart, optionally scoped to an incident. */
    public function thread(Request $request, User $user): JsonResponse
    {
        $authId = $request->user()->id;

        $query = Message::where(function ($q) use ($authId, $user) {
            $q->where('sender_id', $authId)->where('receiver_id', $user->id);
        })->orWhere(function ($q) use ($authId, $user) {
            $q->where('sender_id', $user->id)->where('receiver_id', $authId);
        })->oldest();

        if ($request->filled('incident_id')) {
            $query->where('incident_id', $request->query('incident_id'));
        }

        $messages = $query->get();

        // Mark incoming messages as read
        Message::where('sender_id', $user->id)->where('receiver_id', $authId)->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['data' => $messages]);
    }

    public function store(StoreMessageRequest $request): JsonResponse
    {
        $path = $request->hasFile('attachment') ? $request->file('attachment')->store('messages', 'public') : null;

        $message = DB::transaction(fn () => Message::create([
            'incident_id' => $request->validated('incident_id'),
            'sender_id' => $request->user()->id,
            'receiver_id' => $request->validated('receiver_id'),
            'body' => $request->validated('body'),
            'attachment_path' => $path,
        ]));

        return response()->json(['message' => 'Message sent.', 'data' => $message], 201);
    }
}
