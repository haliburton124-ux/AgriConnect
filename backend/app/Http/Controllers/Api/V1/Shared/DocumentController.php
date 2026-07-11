<?php

namespace App\Http\Controllers\Api\V1\Shared;

use App\Http\Controllers\Controller;
use App\Http\Requests\Document\StoreDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    /** Farmer personal documents — land titles, IDs, permits, etc. */
    public function index(Request $request): JsonResponse
    {
        $documents = Document::query()
            ->where('user_id', $request->user()->id)
            ->where(function ($q) {
                $q->where('visibility', Document::VISIBILITY_PERSONAL)
                    ->orWhereNull('visibility');
            })
            ->latest()
            ->get();

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

    public function destroy(Request $request, Document $document): JsonResponse
    {
        abort_unless($document->user_id === $request->user()->id, 403);
        $document->delete();

        return response()->json(['message' => 'Document removed.']);
    }
}
