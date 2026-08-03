<?php

namespace App\Http\Controllers\Api\V1\Shared;

use App\Http\Controllers\Concerns\HandlesArchiving;
use App\Http\Controllers\Controller;
use App\Http\Requests\Document\StoreDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    use HandlesArchiving;

    /** Farmer personal documents — land titles, IDs, permits, etc. */
    public function index(Request $request): JsonResponse
    {
        $query = Document::query()
            ->where('user_id', $request->user()->id)
            ->where(function ($q) {
                $q->where('visibility', Document::VISIBILITY_PERSONAL)
                    ->orWhereNull('visibility');
            })
            ->latest();

        $documents = $this->applyArchiveScope($query, $request)->get();

        return response()->json(['data' => DocumentResource::collection($documents)]);
    }

    public function store(StoreDocumentRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $path = $file->store('documents/'.$request->user()->id, 'public');

        $document = Document::create([
            'user_id' => $request->user()->id,
            'title' => $request->validated('title'),
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
            'category' => $request->validated('category'),
            'visibility' => Document::VISIBILITY_PERSONAL,
        ]);

        return response()->json([
            'message' => 'Document uploaded successfully.',
            'data' => new DocumentResource($document),
        ], 201);
    }

    public function archive(Request $request, Document $document): JsonResponse
    {
        abort_unless($document->user_id === $request->user()->id, 403);

        return $this->archiveModel($document, 'Document');
    }

    public function restore(Request $request, int $id): JsonResponse
    {
        $document = Document::withArchived()->findOrFail($id);
        abort_unless($document->user_id === $request->user()->id, 403);
        $document->unarchive();

        return response()->json(['message' => 'Document restored.']);
    }
}
