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
        protected ?string $shareCaption = null,
        protected ?int $shareId = null,
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
            'share_id' => $this->shareId,
            'share_caption' => $this->shareCaption,
            'message' => $this->buildMessage(),
        ];
    }

    protected function commentMessage(string $action): string
    {
        $actor = $this->actor->full_name;
        $title = $this->post->title;
        $suffix = $this->commentHasPhoto() ? ' with a photo' : '';

        return "{$actor} {$action} \"{$title}\"{$suffix}.";
    }

    protected function commentHasPhoto(): bool
    {
        return filled($this->comment?->image_path) || filled($this->comment?->image_url);
    }

    protected function buildMessage(): string
    {
        $actor = $this->actor->full_name;
        $title = $this->post->title;

        return match ($this->activityType) {
            'like' => "{$actor} liked your advisory \"{$title}\".",
            'share' => filled($this->shareCaption)
                ? "{$actor} shared your advisory \"{$title}\" with a caption: \"{$this->shareCaption}\"."
                : "{$actor} shared your advisory \"{$title}\".",
            'comment' => $this->commentMessage('commented on'),
            'reply' => $this->commentMessage('replied to your comment on'),
            'mention' => $this->commentMessage('mentioned you on'),
            default => "{$actor} interacted with \"{$title}\".",
        };
    }
}
