<?php

namespace App\Http\Controllers\Api\V1\Program;

use App\Http\Controllers\Controller;
use App\Http\Requests\Program\ApplyProgramRequest;
use App\Models\Program;
use App\Models\ProgramApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgramApplicationController extends Controller
{
    /** Farmer: view their own applications. */
    public function index(Request $request): JsonResponse
    {
        $applications = ProgramApplication::where('farmer_id', $request->user()->id)
            ->with('program:id,title,category')
            ->latest()
            ->paginate($request->integer('per_page', 10));

        return response()->json([
            'data' => $applications->items(),
            'meta' => [
                'current_page' => $applications->currentPage(),
                'last_page' => $applications->lastPage(),
                'total' => $applications->total(),
            ],
        ]);
    }

    public function store(ApplyProgramRequest $request, Program $program): JsonResponse
    {
        abort_if(
            $program->application_end && now()->gt($program->application_end),
            422,
            'The application period for this program has closed.'
        );

        $paths = collect($request->file('documents', []))->map(
            fn ($file) => $file->store('program-applications', 'public')
        )->toArray();

        $application = ProgramApplication::create([
            'program_id' => $program->id,
            'farmer_id' => $request->user()->id,
            'status' => 'submitted',
            'remarks' => $request->validated('remarks'),
            'document_paths' => $paths,
        ]);

        return response()->json([
            'message' => 'Application submitted successfully.',
            'data' => $application,
        ], 201);
    }

    /** MAO/PPO/Admin: review applications, update status. */
    public function updateStatus(Request $request, ProgramApplication $application): JsonResponse
    {
        abort_unless($request->user()->hasRole(['municipal_office', 'provincial_office', 'admin']), 403);

        $validated = $request->validate([
            'status' => ['required', 'in:under_review,approved,rejected'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $application->update($validated);

        return response()->json(['message' => 'Application status updated.', 'data' => $application]);
    }
}
