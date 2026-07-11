<?php

namespace App\Http\Controllers\Api\V1\Content;

use App\Http\Controllers\Controller;
use App\Http\Requests\Content\StoreAnnouncementRequest;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * Publicly browsable (guests see general/province-wide announcements
     * only). Farmers/technicians additionally see anything scoped to their
     * own municipality; office roles see everything they're allowed to manage.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Announcement::query()->where('is_published', true)->with('postedBy:id,first_name,last_name,role')->latest('published_at');

        if (! $user) {
            $query->whereNull('municipality_id')->where('audience', 'all');
        } elseif ($user->hasRole(['farmer', 'technician'])) {
            $query->where(function ($q) use ($user) {
                $q->whereNull('municipality_id')->orWhere('municipality_id', $user->municipality_id);
            })->where(function ($q) use ($user) {
                $q->where('audience', 'all')->orWhere('audience', $user->role === 'farmer' ? 'farmers' : 'technicians');
            });
        }

        $announcements = $query->paginate($request->integer('per_page', 10));

        return response()->json([
            'data' => $announcements->items(),
            'meta' => [
                'current_page' => $announcements->currentPage(),
                'last_page' => $announcements->lastPage(),
                'total' => $announcements->total(),
            ],
        ]);
    }

    public function store(StoreAnnouncementRequest $request): JsonResponse
    {
        $user = $request->user();
        $path = null;

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('announcements', 'public');
        }

        $announcement = Announcement::create([
            'posted_by' => $user->id,
            'title' => $request->validated('title'),
            'content' => $request->validated('content'),
            'cover_image_path' => $path,
            'municipality_id' => $user->hasRole('municipal_office') ? $user->municipality_id : null,
            'audience' => $request->validated('audience'),
            'is_published' => $request->boolean('is_published', true),
            'published_at' => now(),
        ]);

        return response()->json(['message' => 'Announcement posted successfully.', 'data' => $announcement], 201);
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        $announcement->delete();

        return response()->json(['message' => 'Announcement removed.']);
    }
}
