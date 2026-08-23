<?php

namespace App\Http\Controllers\Api\V1\Program;

use App\Http\Controllers\Concerns\HandlesArchiving;
use App\Http\Controllers\Controller;
use App\Http\Requests\Program\StoreProgramRequest;
use App\Models\Program;
use App\Support\MunicipalityContentScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    use HandlesArchiving;

    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('archived') && $request->user()?->hasRole(['provincial_office', 'admin'])) {
            $query = Program::onlyArchived()->latest('archived_at');
        } else {
            $query = Program::query()->where('is_active', true)->latest();
        }

        if ($request->filled('category')) {
            $query->where('category', $request->query('category'));
        }

        MunicipalityContentScope::applyNullableScope($query, $request);

        $programs = $query->paginate($request->integer('per_page', 10));

        return response()->json([
            'data' => $programs->items(),
            'meta' => [
                'current_page' => $programs->currentPage(),
                'last_page' => $programs->lastPage(),
                'total' => $programs->total(),
            ],
        ]);
    }

    public function show(Request $request, Program $program): JsonResponse
    {
        abort_unless(
            MunicipalityContentScope::canAccessNullableContent($request->user(), $program->municipality_id),
            403,
            'This program is not available in your municipality.'
        );

        return response()->json(['data' => $program->load('municipality:id,name')]);
    }

    public function store(StoreProgramRequest $request): JsonResponse
    {
        $data = $request->validated();
        $coverPath = $request->hasFile('cover_image') ? $request->file('cover_image')->store('programs', 'public') : null;

        $program = Program::create([
            'title' => $data['title'],
            'description' => $data['description'],
            'cover_image_path' => $coverPath,
            'category' => $data['category'],
            'application_start' => $data['application_start'] ?? null,
            'application_end' => $data['application_end'] ?? null,
            'eligibility_criteria' => $data['eligibility_criteria'] ?? null,
            'is_active' => $request->boolean('is_active', true),
            'created_by' => $request->user()->id,
            'municipality_id' => $data['municipality_id'] ?? null,
        ]);

        return response()->json(['message' => 'Program published successfully.', 'data' => $program], 201);
    }

    public function archive(Program $program): JsonResponse
    {
        return $this->archiveModel($program, 'Program');
    }

    public function restore(int $id): JsonResponse
    {
        return $this->restoreModel(Program::class, $id, 'Program');
    }
}
