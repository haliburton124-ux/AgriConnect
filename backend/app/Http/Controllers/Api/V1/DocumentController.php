<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $documents = Document::where('user_id', $request->user()->id)->latest()->get();

        return response()->json(['data' => $documents]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'category' => ['required', 'in:land_title,certification,id,permit,other'],
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
        ]);

        $file = $request->file('file');
        $path = $file->store('documents/'.$request->user()->id, 'public');

        $document = Document::create([
            'user_id' => $request->user()->id,
            'title' => $request->input('title'),
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
            'category' => $request->input('category'),
        ]);

        return response()->json(['message' => 'Document uploaded successfully.', 'data' => $document], 201);
    }

    public function destroy(Request $request, Document $document): JsonResponse
    {
        abort_if($document->user_id !== $request->user()->id, 403);
        $document->delete();

        return response()->json(['message' => 'Document removed.']);
    }
}
