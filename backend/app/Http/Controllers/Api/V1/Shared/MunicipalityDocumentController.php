<?php

namespace App\Http\Controllers\Api\V1\Shared;

use App\Http\Controllers\Controller;
use App\Http\Requests\Document\StoreMunicipalityDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MunicipalityDocumentController extends Controller
{
    /**
     * Municipality-only documents — memorandums, internal announcements,
     * reports, permits, and other confidential LGU files. Visible only
     * to users belonging to the posting municipality.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->municipality_id, 403, 'You are not assigned to a municipality.');

        $documents = Document::query()
            ->where('visibility', Document::VISIBILITY_MUNICIPALITY)
            ->where('municipality_id', $user->municipality_id)
            ->with(['municipality', 'user'])
            ->latest()
            ->get();

        return response()->json(['data' => DocumentResource::collection($documents)]);
    }

    public function store(StoreMunicipalityDocumentRequest $request): JsonResponse
    {
        $user = $request->user();
        $file = $request->file('file');

        $municipalityId = $user->hasRole('municipal_office')
            ? $user->municipality_id
            : $request->validated('municipality_id');

        abort_unless($municipalityId, 422, 'A municipality must be specified for this document.');

        $path = $file->store("municipality-documents/{$municipalityId}", 'public');

        $document = Document::create([
            'user_id' => $user->id,
            'municipality_id' => $municipalityId,
            'title' => $request->validated('title'),
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
            'category' => $request->validated('category'),
            'visibility' => Document::VISIBILITY_MUNICIPALITY,
        ]);

        return response()->json([
            'message' => 'Municipality document uploaded successfully.',
            'data' => new DocumentResource($document->load(['municipality', 'user'])),
        ], 201);
    }

    public function destroy(Request $request, Document $document): JsonResponse
    {
        abort_unless($document->isMunicipalityOnly(), 404);
        abort_unless(
            $request->user()->hasRole(['municipal_office', 'provincial_office', 'admin']),
            403,
        );

        if ($request->user()->hasRole('municipal_office')) {
            abort_unless($document->municipality_id === $request->user()->municipality_id, 403);
        }

        $document->delete();

        return response()->json(['message' => 'Municipality document removed.']);
    }
}
