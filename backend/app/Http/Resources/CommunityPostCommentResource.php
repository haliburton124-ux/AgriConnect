<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommunityPostCommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'body' => $this->body,
            'parent_id' => $this->parent_id,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'full_name' => $this->user->full_name,
                'role' => $this->user->role,
            ]),
            'replies' => $this->when(
                $this->relationLoaded('replies'),
                fn () => CommunityPostCommentResource::collection($this->replies)->resolve(),
            ),
            'created_at' => $this->created_at,
        ];
    }
}
