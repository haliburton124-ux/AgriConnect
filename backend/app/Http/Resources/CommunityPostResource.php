<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommunityPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'image_path' => $this->image_path ?? $this->images->first()?->path,
            'image_paths' => $this->images->pluck('path')->values()->all()
                ?: ($this->image_path ? [$this->image_path] : []),
            'category' => $this->category,
            'is_published' => $this->is_published,
            'likes_count' => $this->likes_count,
            'comments_count' => $this->comments_count,
            'shares_count' => $this->shares_count,
            'municipality' => $this->whenLoaded('municipality', fn () => [
                'id' => $this->municipality->id,
                'name' => $this->municipality->name,
            ]),
            'author' => $this->whenLoaded('author', fn () => [
                'id' => $this->author->id,
                'full_name' => $this->author->full_name,
                'role' => $this->author->role,
            ]),
            'liked_by_me' => filter_var($this->liked_by_me ?? false, FILTER_VALIDATE_BOOLEAN),
            'shared_by_me' => filter_var($this->shared_by_me ?? false, FILTER_VALIDATE_BOOLEAN),
            'shared_at' => $this->when(isset($this->shared_at), $this->shared_at),
            'is_shared_in_feed' => $this->when(isset($this->is_shared_in_feed), (bool) $this->is_shared_in_feed),
            'share_caption' => $this->when(isset($this->share_caption), $this->share_caption),
            'shared_by' => $this->when(isset($this->shared_by), function () {
                $sharer = $this->shared_by;

                return [
                    'id' => $sharer->id,
                    'full_name' => $sharer->full_name,
                    'role' => $sharer->role,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
