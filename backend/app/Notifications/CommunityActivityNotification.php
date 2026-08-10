<?php

namespace App\Notifications;

use App\Models\CommunityPost;
use App\Models\CommunityPostComment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CommunityActivityNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected string $activityType,
        protected CommunityPost $post,
        protected User $actor,
        protected ?CommunityPostComment $comment = null,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'activity_type' => $this->activityType,
            'post_id' => $this->post->id,
            'post_title' => $this->post->title,
            'comment_id' => $this->comment?->id,
            'parent_comment_id' => $this->comment?->parent_id,
            'actor_id' => $this->actor->id,
            'actor_name' => $this->actor->full_name,
            'message' => $this->buildMessage(),
        ];
    }

    protected function buildMessage(): string
    {
        $actor = $this->actor->full_name;
        $title = $this->post->title;

        return match ($this->activityType) {
            'like' => "{$actor} liked your advisory \"{$title}\".",
            'share' => "{$actor} shared your advisory \"{$title}\".",
            'comment' => "{$actor} commented on \"{$title}\".",
            'reply' => "{$actor} replied to your comment on \"{$title}\".",
            'mention' => "{$actor} mentioned you on \"{$title}\".",
            default => "{$actor} interacted with \"{$title}\".",
        };
    }
}
