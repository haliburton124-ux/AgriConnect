<?php

namespace App\Http\Controllers\Api\V1\Community;

use App\Http\Controllers\Controller;
use App\Http\Requests\Community\StoreCommunityPostCommentRequest;
use App\Http\Requests\Community\StoreCommunityPostRequest;
use App\Http\Resources\CommunityPostCommentResource;
use App\Http\Resources\CommunityPostResource;
use App\Models\CommunityPost;
use App\Models\CommunityPostComment;
use App\Models\CommunityPostLike;
use App\Models\CommunityPostShare;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommunityPostController extends Controller
{
    public function categories(): JsonResponse
    {
        return response()->json([
            'data' => collect(CommunityPost::CATEGORIES)->map(fn (string $category) => [
                'value' => $category,
                'label' => str($category)->replace('_', ' ')->title()->toString(),
            ])->values(),
        ]);
    }

    /**
     * Public agricultural advisories — visible to all registered farmers
     * regardless of which municipality posted them.
     */
    public function index(Request $request): JsonResponse
    {
        $posts = $this->baseQuery($request)
            ->latest()
            ->paginate($request->integer('per_page', 12));

        return $this->paginatedResponse($posts);
    }

    /**
     * Farmer news feed — public posts plus items the farmer has shared,
     * with the originating municipality clearly attributed.
     */
    public function feed(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user && $user->hasRole('farmer'), 403);

        $sharedIds = CommunityPostShare::where('user_id', $user->id)
            ->pluck('created_at', 'community_post_id');

        $posts = $this->baseQuery($request)
            ->latest()
            ->paginate($request->integer('per_page', 15))
            ->through(function (CommunityPost $post) use ($sharedIds) {
                if ($sharedIds->has($post->id)) {
                    $post->is_shared_in_feed = true;
                    $post->shared_at = $sharedIds[$post->id];
                }

                return $post;
            });

        return $this->paginatedResponse($posts);
    }

    public function show(Request $request, CommunityPost $communityPost): JsonResponse
    {
        abort_unless($communityPost->is_published, 404);

        $this->applyEngagementFlags($request, collect([$communityPost]));

        return response()->json([
            'data' => new CommunityPostResource(
                $communityPost->load(['municipality', 'author']),
            ),
        ]);
    }

    public function store(StoreCommunityPostRequest $request): JsonResponse
    {
        $user = $request->user();

        $municipalityId = $user->hasRole('municipal_office')
            ? $user->municipality_id
            : $request->validated('municipality_id');

        abort_unless($municipalityId, 422, 'A municipality must be specified for this post.');

        $post = CommunityPost::create([
            'municipality_id' => $municipalityId,
            'author_id' => $user->id,
            'title' => $request->validated('title'),
            'content' => $request->validated('content'),
            'category' => $request->validated('category'),
            'is_published' => $request->boolean('is_published', true),
        ]);

        return response()->json([
            'message' => 'Agricultural advisory published successfully.',
            'data' => new CommunityPostResource($post->load(['municipality', 'author'])),
        ], 201);
    }

    public function destroy(Request $request, CommunityPost $communityPost): JsonResponse
    {
        abort_unless(
            $request->user()->hasRole(['municipal_office', 'provincial_office', 'admin']),
            403,
        );

        if ($request->user()->hasRole('municipal_office')) {
            abort_unless($communityPost->municipality_id === $request->user()->municipality_id, 403);
        }

        $communityPost->delete();

        return response()->json(['message' => 'Post removed.']);
    }

    public function toggleLike(Request $request, CommunityPost $communityPost): JsonResponse
    {
        abort_unless($communityPost->is_published, 404);

        $user = $request->user();
        $existing = CommunityPostLike::where('community_post_id', $communityPost->id)
            ->where('user_id', $user->id)
            ->first();

        DB::transaction(function () use ($existing, $communityPost, $user) {
            if ($existing) {
                $existing->delete();
                $communityPost->decrement('likes_count');
            } else {
                CommunityPostLike::create([
                    'community_post_id' => $communityPost->id,
                    'user_id' => $user->id,
                ]);
                $communityPost->increment('likes_count');
            }
        });

        $communityPost->refresh();
        $this->applyEngagementFlags($request, collect([$communityPost]));

        return response()->json([
            'message' => $existing ? 'Like removed.' : 'Post liked.',
            'data' => new CommunityPostResource($communityPost->load(['municipality', 'author'])),
        ]);
    }

    public function share(Request $request, CommunityPost $communityPost): JsonResponse
    {
        abort_unless($communityPost->is_published, 404);

        $user = $request->user();

        $share = CommunityPostShare::firstOrCreate([
            'community_post_id' => $communityPost->id,
            'user_id' => $user->id,
        ]);

        if ($share->wasRecentlyCreated) {
            $communityPost->increment('shares_count');
        }

        $communityPost->refresh();
        $post = $communityPost->load(['municipality', 'author']);
        $post->is_shared_in_feed = true;
        $post->shared_at = $share->created_at;
        $this->applyEngagementFlags($request, collect([$post]));

        return response()->json([
            'message' => 'Post shared to your feed.',
            'data' => new CommunityPostResource($post),
        ]);
    }

    public function comments(CommunityPost $communityPost): JsonResponse
    {
        abort_unless($communityPost->is_published, 404);

        $comments = $communityPost->comments()
            ->with(['user', 'replies' => fn ($query) => $query->with(['user', 'replies.user'])])
            ->latest()
            ->get();

        return response()->json(['data' => CommunityPostCommentResource::collection($comments)]);
    }

    public function storeComment(
        StoreCommunityPostCommentRequest $request,
        CommunityPost $communityPost,
    ): JsonResponse {
        abort_unless($communityPost->is_published, 404);

        if ($request->filled('parent_id')) {
            $parent = CommunityPostComment::findOrFail($request->integer('parent_id'));
            abort_unless($parent->community_post_id === $communityPost->id, 422);
        }

        $comment = $communityPost->allComments()->create([
            'user_id' => $request->user()->id,
            'parent_id' => $request->validated('parent_id'),
            'body' => $request->validated('body'),
        ]);

        $communityPost->increment('comments_count');

        return response()->json([
            'message' => 'Comment posted.',
            'data' => new CommunityPostCommentResource($comment->load('user')),
        ], 201);
    }

    protected function baseQuery(Request $request)
    {
        $query = CommunityPost::query()
            ->where('is_published', true)
            ->with(['municipality', 'author']);

        if ($request->filled('category')) {
            $query->where('category', $request->query('category'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($request->filled('municipality_id')) {
            $query->where('municipality_id', $request->integer('municipality_id'));
        }

        $this->applyEngagementFlags($request, null, $query);

        return $query;
    }

    protected function applyEngagementFlags(Request $request, $collection = null, $query = null): void
    {
        $user = $request->user();
        if (! $user) {
            return;
        }

        $callback = function ($q) use ($user) {
            $q->where('user_id', $user->id);
        };

        if ($query) {
            $query->withExists(['likes as liked_by_me' => $callback])
                ->withExists(['shares as shared_by_me' => $callback]);

            return;
        }

        $collection?->each(function (CommunityPost $post) use ($user) {
            $post->liked_by_me = $post->likes()->where('user_id', $user->id)->exists();
            $post->shared_by_me = $post->shares()->where('user_id', $user->id)->exists();
        });
    }

    protected function paginatedResponse($paginator): JsonResponse
    {
        return response()->json([
            'data' => CommunityPostResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }
}
