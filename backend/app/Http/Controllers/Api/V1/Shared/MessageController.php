<?php

namespace App\Http\Controllers\Api\V1\Shared;

use App\Http\Controllers\Controller;
use App\Http\Requests\Message\StoreMessageRequest;
use App\Models\Message;
use App\Models\User;
use App\Notifications\NewMessageNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Direct messaging between a farmer and their assigned technician,
 * optionally scoped to a specific incident's consultation thread.
 */
class MessageController extends Controller
{
    /** List conversation threads, including assigned contacts with no messages yet. */
    public function threads(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = $user->id;

        $messagePartnerIds = Message::query()
            ->where(function ($q) use ($userId) {
                $q->where('sender_id', $userId)->orWhere('receiver_id', $userId);
            })
            ->get(['sender_id', 'receiver_id'])
            ->flatMap(fn ($m) => [$m->sender_id, $m->receiver_id])
            ->unique()
            ->reject(fn ($id) => (int) $id === $userId)
            ->values();

        $partnerIds = $messagePartnerIds
            ->merge(self::assignedContactIdsFor($user))
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->filter()
            ->values();

        $threads = User::query()
            ->whereIn('id', $partnerIds)
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
            ->sortByDesc(fn ($t) => $t['last_message']?->created_at?->timestamp ?? 0)
            ->values();

        return response()->json(['data' => $threads]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = Message::query()
            ->where('receiver_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();

        return response()->json(['count' => $count]);
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

        $request->user()->unreadNotifications
            ->filter(fn ($notification) => ($notification->data['activity_type'] ?? null) === 'message'
                && (int) ($notification->data['sender_id'] ?? 0) === $partnerId)
            ->each->markAsRead();

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

        $receiver = User::query()->find($message->receiver_id);
        $receiver?->notify(new NewMessageNotification($message, $request->user()));

        return response()->json(['message' => 'Message sent.', 'data' => $message], 201);
    }

    /** Farmers may message assigned technicians; technicians may message their assigned farmers. */
    public static function assignedContactIdsFor(User $user): Collection
    {
        if ($user->hasRole('farmer')) {
            $fromIncidents = DB::table('incidents')
                ->where('farmer_id', $user->id)
                ->whereNotNull('assigned_technician_id')
                ->pluck('assigned_technician_id');

            $fromHistory = DB::table('incident_assignments')
                ->join('incidents', 'incidents.id', '=', 'incident_assignments.incident_id')
                ->where('incidents.farmer_id', $user->id)
                ->pluck('incident_assignments.technician_id');

            return $fromIncidents
                ->merge($fromHistory)
                ->map(fn ($id) => (int) $id)
                ->unique()
                ->filter()
                ->values();
        }

        if ($user->hasRole('technician')) {
            return DB::table('incidents')
                ->where('assigned_technician_id', $user->id)
                ->pluck('farmer_id')
                ->map(fn ($id) => (int) $id)
                ->unique()
                ->filter()
                ->values();
        }

        return collect();
    }
}
