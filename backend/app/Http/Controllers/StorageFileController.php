<?php

namespace App\Http\Controllers;

use App\Services\PublicMediaStorage;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StorageFileController extends Controller
{
    /**
     * Serve files from the public media disk. Used when MEDIA_DISK=public
     * (local dev or Railway with a persistent volume).
     */
    public function show(Request $request, string $path): StreamedResponse
    {
        $path = ltrim(str_replace('\\', '/', $path), '/');

        if ($path === '' || str_contains($path, '..')) {
            abort(404);
        }

        $disk = app(PublicMediaStorage::class)->disk();

        if (! $disk->exists($path)) {
            abort(404);
        }

        return $disk->response($path);
    }
}
