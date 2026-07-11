<?php

namespace App\Http\Controllers\Api\V1\Shared;

use App\Http\Controllers\Controller;
use App\Http\Requests\Message\StoreMessageRequest;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Direct messaging between a farmer and their assigned technician,
 * optionally scoped to a specific incident's consultation thread.
 */
class MessageController extends Controller
{
    /** List distinct conversation threads for the current user. */
    public function threads(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $partnerIds = Message::query()
            ->where('sender_id', $userId)->orWhere('receiver_id', $userId)
            ->get(['sender_id', 'receiver_id'])
            ->flatMap(fn ($m) => [$m->sender_id, $m->receiver_id])
            ->unique()
            ->reject(fn ($id) => $id === $userId)
            ->values();

        $threads = \App\Models\User::whereIn('id', $partnerIds)
            ->get(['id', 'first_name', 'last_name', 'role'])
            ->map(function ($partner) use ($userId) {
                $last = Message::where(function ($q) use ($userId, $partner) {
                    $q->where('sender_id', $userId)->where('receiver_id', $partner->id);
                })->orWhere(function ($q) use ($userId, $partner) {
                    $q->where('sender_id', $partner->id)->where('receiver_id', $userId);
                })->latest()->first();

                $unread = Message::where('sender_id', $partner->id)
                    ->where('receiver_id', $userId)
                    ->whereNull('read_at')
                    ->count();

                return [
                    'partner' => $partner,
                    'last_message' => $last,
                    'unread_count' => $unread,
                ];
            })
            ->sortByDesc(fn ($t) => $t['last_message']?->created_at)
            ->values();

        return response()->json(['data' => $threads]);
    }

    /** Conversation history with a specific user. */
    public function conversation(Request $request, int $partnerId): JsonResponse
    {
        $userId = $request->user()->id;

        $messages = Message::query()
            ->where(function ($q) use ($userId, $partnerId) {
                $q->where('sender_id', $userId)->where('receiver_id', $partnerId);
            })
            ->orWhere(function ($q) use ($userId, $partnerId) {
                $q->where('sender_id', $partnerId)->where('receiver_id', $userId);
            })
            ->orderBy('created_at')
            ->paginate($request->integer('per_page', 30));

        // Mark incoming messages as read.
        Message::where('sender_id', $partnerId)->where('receiver_id', $userId)
            ->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json([
            'data' => $messages->items(),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'total' => $messages->total(),
            ],
        ]);
    }

    public function store(StoreMessageRequest $request): JsonResponse
    {
        $path = $request->hasFile('attachment') ? $request->file('attachment')->store('messages', 'public') : null;

        $message = Message::create([
            'incident_id' => $request->validated('incident_id'),
            'sender_id' => $request->user()->id,
            'receiver_id' => $request->validated('receiver_id'),
            'body' => $request->validated('body'),
            'attachment_path' => $path,
        ]);

        return response()->json(['message' => 'Message sent.', 'data' => $message], 201);
    }
}
