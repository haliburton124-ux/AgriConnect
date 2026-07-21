<?php

namespace App\Services;

use App\Models\CommunityPost;
use App\Models\CommunityPostComment;
use App\Models\User;
use App\Notifications\CommunityActivityNotification;
use Illuminate\Support\Collection;

class CommunityNotificationService
{
    public function notifyLike(CommunityPost $post, User $actor): void
    {
        $recipient = $post->author;
        if (! $recipient || $recipient->id === $actor->id) {
            return;
        }

        $recipient->notify(new CommunityActivityNotification('like', $post, $actor));
    }

    public function notifyShare(CommunityPost $post, User $actor): void
    {
        $recipient = $post->author;
        if (! $recipient || $recipient->id === $actor->id) {
            return;
        }

        $recipient->notify(new CommunityActivityNotification('share', $post, $actor));
    }

    public function notifyComment(CommunityPost $post, CommunityPostComment $comment, User $actor): void
    {
        $recipients = collect();

        if ($comment->parent_id) {
            $parent = CommunityPostComment::with('user')->find($comment->parent_id);
            if ($parent?->user && $parent->user->id !== $actor->id) {
                $recipients->put($parent->user->id, $parent->user);
                $parent->user->notify(new CommunityActivityNotification('reply', $post, $actor, $comment));
            }
        }

        if ($post->author && $post->author->id !== $actor->id && ! $recipients->has($post->author->id)) {
            $post->author->notify(new CommunityActivityNotification('comment', $post, $actor, $comment));
        }

        $this->notifyMentions($post, $comment, $actor, $recipients);
    }

    protected function notifyMentions(
        CommunityPost $post,
        CommunityPostComment $comment,
        User $actor,
        Collection $alreadyNotified,
    ): void {
        if (! preg_match_all('/@([A-Za-z][A-Za-z0-9_.\s-]{1,60})/', $comment->body, $matches)) {
            return;
        }

        $candidates = $post->allComments()->with('user')->get()
            ->pluck('user')
            ->filter()
            ->merge([$post->author])
            ->unique('id')
            ->filter(fn (?User $user) => $user && $user->id !== $actor->id);

        foreach (array_unique($matches[1]) as $mention) {
            $needle = strtolower(trim($mention));
            $matched = $candidates->first(function (User $user) use ($needle) {
                $full = strtolower($user->full_name);
                $first = strtolower($user->first_name);

                return $needle === $full
                    || $needle === $first
                    || str_starts_with($full, $needle);
            });

            if (! $matched || $alreadyNotified->has($matched->id)) {
                continue;
            }

            $matched->notify(new CommunityActivityNotification('mention', $post, $actor, $comment));
            $alreadyNotified->put($matched->id, $matched);
        }
    }
}
