<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class KnowledgeArticleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $attachments = collect($this->attachments ?? [])->map(function ($file) {
            $path = $file['path'] ?? null;

            return [
                'path' => $path,
                'name' => $file['name'] ?? basename((string) $path),
                'mime' => $file['mime'] ?? null,
                'kind' => $file['kind'] ?? 'file',
                'url' => $path ? Storage::disk('public')->url($path) : null,
            ];
        })->values();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => $this->content,
            'cover_image_path' => $this->cover_image_path,
            'type' => $this->type,
            'video_url' => $this->video_url,
            'pdf_path' => $this->pdf_path,
            'attachments' => $attachments,
            'is_published' => $this->is_published,
            'published_at' => $this->published_at,
            'view_count' => $this->view_count,
            'municipality' => $this->whenLoaded('municipality', fn () => $this->municipality ? [
                'id' => $this->municipality->id,
                'name' => $this->municipality->name,
            ] : null),
            'category' => $this->whenLoaded('category', fn () => $this->category ? [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ] : null),
            'author' => $this->whenLoaded('author', fn () => $this->author ? [
                'id' => $this->author->id,
                'first_name' => $this->author->first_name,
                'last_name' => $this->author->last_name,
                'full_name' => $this->author->full_name,
            ] : null),
            'created_at' => $this->created_at,
        ];
    }
}
