<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('community_post_images', function (Blueprint $table) {
            $table->string('url', 2048)->nullable()->after('path');
        });

        $diskName = config('media.disk', 'public');

        \Illuminate\Support\Facades\DB::table('community_post_images')
            ->whereNull('url')
            ->orderBy('id')
            ->chunkById(100, function ($rows) use ($diskName) {
                foreach ($rows as $row) {
                    \Illuminate\Support\Facades\DB::table('community_post_images')
                        ->where('id', $row->id)
                        ->update([
                            'url' => \Illuminate\Support\Facades\Storage::disk($diskName)->url($row->path),
                        ]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('community_post_images', function (Blueprint $table) {
            $table->dropColumn('url');
        });
    }
};
