<?php

namespace App\Http\Controllers\Api\V1\Knowledge;

use App\Http\Controllers\Concerns\HandlesArchiving;
use App\Http\Controllers\Controller;
use App\Http\Requests\Knowledge\StoreKnowledgeArticleRequest;
use App\Http\Resources\KnowledgeArticleResource;
use App\Models\KnowledgeArticle;
use App\Models\KnowledgeCategory;
use App\Support\MunicipalityVisibility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class KnowledgeArticleController extends Controller
{
    use HandlesArchiving;

    public function index(Request $request): JsonResponse
    {
        $query = KnowledgeArticle::query()
            ->where('is_published', true)
            ->where(function ($q) {
                $q->whereNull('published_at')->orWhere('published_at', '<=', now());
            })
            ->with(['category', 'author:id,first_name,last_name', 'municipality:id,name'])
            ->latest('published_at')
            ->latest();

        if ($request->boolean('office')) {
            abort_unless($request->user(), 401);

            return $this->manage($request);
        }

        MunicipalityVisibility::applyViewerScope($query, $request);

        if (! $request->user()) {
            return response()->json([
                'data' => [],
                'meta' => ['current_page' => 1, 'last_page' => 1, 'total' => 0],
            ]);
        }

        if ($request->user()->hasRole(['farmer', 'technician'])) {
            abort_unless($request->user()->municipality_id, 403, 'Your account is not assigned to a municipality.');
        }

        $this->applyFilters($query, $request);

        $articles = $query->paginate($request->integer('per_page', 12));

        return response()->json([
            'data' => KnowledgeArticleResource::collection($articles->items()),
            'meta' => [
                'current_page' => $articles->currentPage(),
                'last_page' => $articles->lastPage(),
                'total' => $articles->total(),
            ],
        ]);
    }

    /** MAO/PPO/Admin management list — includes unpublished drafts and archived items. */
    public function manage(Request $request): JsonResponse
    {
        $this->authorizeManage($request);
        $user = $request->user();

        $query = $request->boolean('archived')
            ? KnowledgeArticle::onlyArchived()->latest('archived_at')
            : KnowledgeArticle::query()->latest();

        $query->with(['category', 'author:id,first_name,last_name', 'municipality:id,name']);

        if ($user->hasRole('municipal_office')) {
            abort_unless($user->municipality_id, 422, 'Your account is not assigned to a municipality.');
            $query->where('municipality_id', $user->municipality_id);
        }

        $this->applyFilters($query, $request);

        $articles = $query->paginate($request->integer('per_page', 20));

        return response()->json([
            'data' => KnowledgeArticleResource::collection($articles->items()),
            'meta' => [
                'current_page' => $articles->currentPage(),
                'last_page' => $articles->lastPage(),
                'total' => $articles->total(),
            ],
        ]);
    }

    public function categories(): JsonResponse
    {
        $this->ensureDefaultCategories();

        return response()->json(['data' => KnowledgeCategory::withCount('articles')->orderBy('name')->get()]);
    }

    public function show(Request $request, KnowledgeArticle $article): JsonResponse
    {
        abort_unless($article->is_published, 404);
        MunicipalityVisibility::assertCanView($request->user(), $article->municipality_id);

        $article->increment('view_count');

        return response()->json([
            'data' => new KnowledgeArticleResource(
                $article->load(['category', 'author:id,first_name,last_name', 'municipality:id,name']),
            ),
        ]);
    }

    public function store(StoreKnowledgeArticleRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();
        $municipalityId = MunicipalityVisibility::municipalityIdForCreate($user);

        $coverPath = $request->hasFile('cover_image')
            ? $request->file('cover_image')->store('knowledge/covers', 'public')
            : null;

        $pdfPath = $request->hasFile('pdf_file')
            ? $request->file('pdf_file')->store('knowledge/pdfs', 'public')
            : null;

        $attachments = $this->storeAttachments($request);

        if (! $coverPath) {
            $firstImage = collect($attachments)->firstWhere('kind', 'image');
            $coverPath = $firstImage['path'] ?? null;
        }

        $isPublished = $request->boolean('is_published', true);
        $publishedAt = $data['published_at'] ?? ($isPublished ? now() : null);

        $article = KnowledgeArticle::create([
            'category_id' => $data['category_id'] ?? null,
            'title' => $data['title'],
            'slug' => Str::slug($data['title']).'-'.Str::random(6),
            'content' => $data['content'],
            'cover_image_path' => $coverPath,
            'type' => $data['type'] ?? 'article',
            'video_url' => $data['video_url'] ?? null,
            'pdf_path' => $pdfPath,
            'attachments' => $attachments,
            'author_id' => $user->id,
            'municipality_id' => $municipalityId,
            'is_published' => $isPublished,
            'published_at' => $publishedAt,
        ]);

        return response()->json([
            'message' => 'Knowledge Center post published for your municipality.',
            'data' => new KnowledgeArticleResource(
                $article->load(['category', 'author:id,first_name,last_name', 'municipality:id,name']),
            ),
        ], 201);
    }

    public function archive(Request $request, KnowledgeArticle $article): JsonResponse
    {
        $this->authorizeManage($request);
        MunicipalityVisibility::assertCanManage($request->user(), $article->municipality_id);

        return $this->archiveModel($article, 'Knowledge Center post');
    }

    public function restore(Request $request, int $id): JsonResponse
    {
        $this->authorizeManage($request);
        $article = KnowledgeArticle::withArchived()->findOrFail($id);
        MunicipalityVisibility::assertCanManage($request->user(), $article->municipality_id);

        return $this->restoreModel(KnowledgeArticle::class, $id, 'Knowledge Center post');
    }

    protected function authorizeManage(Request $request): void
    {
        abort_unless($request->user(), 401);
        abort_unless($request->user()->hasRole(['municipal_office', 'provincial_office', 'admin']), 403);
    }

    protected function applyFilters($query, Request $request): void
    {
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }
        if ($request->filled('type')) {
            $query->where('type', $request->query('type'));
        }
        if ($request->filled('search')) {
            $term = $request->query('search');
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                    ->orWhere('content', 'like', "%{$term}%");
            });
        }
    }

    protected function storeAttachments(Request $request): array
    {
        $attachments = [];

        foreach ($request->file('images', []) as $file) {
            $path = $file->store('knowledge/images', 'public');
            $attachments[] = [
                'path' => $path,
                'name' => $file->getClientOriginalName(),
                'mime' => $file->getClientMimeType(),
                'kind' => 'image',
            ];
        }

        foreach ($request->file('attachments', []) as $file) {
            $path = $file->store('knowledge/files', 'public');
            $attachments[] = [
                'path' => $path,
                'name' => $file->getClientOriginalName(),
                'mime' => $file->getClientMimeType(),
                'kind' => 'file',
            ];
        }

        return $attachments;
    }

    protected function ensureDefaultCategories(): void
    {
        if (KnowledgeCategory::exists()) {
            return;
        }

        foreach ([
            'Crop Guides',
            'Pests & Diseases',
            'Farming Practices',
            'Weather & Climate',
            'Advisories',
            'Learning Materials',
        ] as $name) {
            KnowledgeCategory::create([
                'name' => $name,
                'slug' => Str::slug($name),
            ]);
        }
    }
}
