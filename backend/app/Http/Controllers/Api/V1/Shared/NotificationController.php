<?php

namespace App\Http\Controllers\Api\V1\Shared;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $paginator = $user->notifications()->paginate($request->integer('per_page', 20));

        return response()->json([
            'data' => collect($paginator->items())->map(fn ($notification) => $this->format($notification))->values(),
            'unread_count' => $user->unreadNotifications()->count(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    public function markAsRead(Request $request, string $notification): JsonResponse
    {
        $item = $request->user()->notifications()->where('id', $notification)->firstOrFail();
        $item->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read.',
            'data' => $this->format($item->fresh()),
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'All notifications marked as read.']);
    }

    protected function format($notification): array
    {
        $data = is_array($notification->data) ? $notification->data : json_decode($notification->data, true) ?? [];

        return [
            'id' => $notification->id,
            'type' => $data['activity_type'] ?? 'community',
            'message' => $data['message'] ?? '',
            'post_id' => $data['post_id'] ?? null,
            'comment_id' => $data['comment_id'] ?? null,
            'parent_comment_id' => $data['parent_comment_id'] ?? null,
            'actor_id' => $data['actor_id'] ?? null,
            'actor_name' => $data['actor_name'] ?? null,
            'post_title' => $data['post_title'] ?? null,
            'read_at' => $notification->read_at,
            'created_at' => $notification->created_at,
        ];
    }
}
