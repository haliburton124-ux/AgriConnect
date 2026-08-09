<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Public media disk
    |--------------------------------------------------------------------------
    |
    | Disk used for user-uploaded photos and documents that must be publicly
    | accessible via a permanent URL. Set MEDIA_DISK=s3 (or Cloudflare R2)
    | on Railway; local development typically uses "public".
    |
    */

    'disk' => env('MEDIA_DISK', env('FILESYSTEM_DISK', 'public')),

];
