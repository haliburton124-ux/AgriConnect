<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PublicMediaStorage
{
    public function diskName(): string
    {
        return (string) config('media.disk', 'public');
    }

    public function disk()
    {
        return Storage::disk($this->diskName());
    }

    /**
     * @return array{path: string, url: string}
     */
    public function storeUpload(UploadedFile $file, string $directory): array
    {
        $diskName = $this->diskName();
        $path = Storage::disk($diskName)->putFile($directory, $file, 'public');

        return [
            'path' => $path,
            'url' => $this->urlForPath($path, $diskName),
        ];
    }

    public function urlForPath(string $path, ?string $diskName = null): string
    {
        return Storage::disk($diskName ?? $this->diskName())->url($path);
    }
}
