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
            'liked_by_me' => (bool) ($this->liked_by_me ?? false),
            'shared_by_me' => (bool) ($this->shared_by_me ?? false),
            'shared_at' => $this->when(isset($this->shared_at), $this->shared_at),
            'is_shared_in_feed' => $this->when(isset($this->is_shared_in_feed), (bool) $this->is_shared_in_feed),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
