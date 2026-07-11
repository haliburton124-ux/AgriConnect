<?php

namespace App\Http\Controllers\Api\V1\Knowledge;

use App\Http\Controllers\Controller;
use App\Http\Requests\Knowledge\StoreKnowledgeArticleRequest;
use App\Models\KnowledgeArticle;
use App\Models\KnowledgeCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class KnowledgeArticleController extends Controller
{
    /** Public knowledge base browse — available to every authenticated role. */
    public function index(Request $request): JsonResponse
    {
        $query = KnowledgeArticle::query()
            ->where('is_published', true)
            ->with(['category', 'author:id,first_name,last_name'])
            ->latest();

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }
        if ($request->filled('type')) {
            $query->where('type', $request->query('type'));
        }
        if ($request->filled('search')) {
            $query->where('title', 'like', '%'.$request->query('search').'%');
        }

        $articles = $query->paginate($request->integer('per_page', 12));

        return response()->json([
            'data' => $articles->items(),
            'meta' => [
                'current_page' => $articles->currentPage(),
                'last_page' => $articles->lastPage(),
                'total' => $articles->total(),
            ],
        ]);
    }

    public function categories(): JsonResponse
    {
        return response()->json(['data' => KnowledgeCategory::withCount('articles')->orderBy('name')->get()]);
    }

    public function show(KnowledgeArticle $article): JsonResponse
    {
        $article->increment('view_count');

        return response()->json(['data' => $article->load(['category', 'author:id,first_name,last_name'])]);
    }

    /** Write access: Municipal/Provincial Office and Admin only (see request authorize()). */
    public function store(StoreKnowledgeArticleRequest $request): JsonResponse
    {
        $data = $request->validated();
        $coverPath = $request->hasFile('cover_image') ? $request->file('cover_image')->store('knowledge/covers', 'public') : null;
        $pdfPath = $request->hasFile('pdf_file') ? $request->file('pdf_file')->store('knowledge/pdfs', 'public') : null;

        $article = KnowledgeArticle::create([
            'category_id' => $data['category_id'] ?? null,
            'title' => $data['title'],
            'slug' => Str::slug($data['title']).'-'.Str::random(6),
            'content' => $data['content'],
            'cover_image_path' => $coverPath,
            'type' => $data['type'],
            'video_url' => $data['video_url'] ?? null,
            'pdf_path' => $pdfPath,
            'author_id' => $request->user()->id,
            'is_published' => $request->boolean('is_published', true),
        ]);

        return response()->json(['message' => 'Article published successfully.', 'data' => $article], 201);
    }

    public function destroy(Request $request, KnowledgeArticle $article): JsonResponse
    {
        $this->authorizeManage($request);
        $article->delete();

        return response()->json(['message' => 'Article removed.']);
    }

    protected function authorizeManage(Request $request): void
    {
        abort_unless($request->user()->hasRole(['municipal_office', 'provincial_office', 'admin']), 403);
    }
}
