<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\ProfilePhoto;
use App\Models\User;
use App\Services\PublicMediaStorage;
use Symfony\Component\HttpFoundation\Response;

class AvatarController extends Controller
{
    public function show(User $user, PublicMediaStorage $media): Response
    {
        $photo = ProfilePhoto::query()->find($user->id);

        if ($photo?->data) {
            $binary = base64_decode($photo->data, true);
            if ($binary !== false && $binary !== '') {
                return response($binary, 200, [
                    'Content-Type' => $photo->mime ?: 'image/jpeg',
                    'Cache-Control' => 'public, max-age=86400',
                ]);
            }
        }

        if ($user->avatar_path && $media->disk()->exists($user->avatar_path)) {
            return $media->disk()->response($user->avatar_path);
        }

        abort(404);
    }
}
