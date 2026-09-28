<?php

namespace App\Http\Controllers\Api\V1\Technician;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'availability' => ['required', 'in:available,busy,on_leave'],
        ]);

        $user = $request->user();
        $user->technicianProfile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'availability' => $validated['availability'],
                'assigned_municipality_id' => $user->municipality_id,
            ],
        );

        return response()->json([
            'message' => 'Availability updated.',
            'user' => new UserResource($user->fresh()->load(['municipality', 'barangay', 'technicianProfile'])),
        ]);
    }
}
