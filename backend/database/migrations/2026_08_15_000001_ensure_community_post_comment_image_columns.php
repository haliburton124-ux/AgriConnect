<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('community_post_comments')) {
            return;
        }

        Schema::table('community_post_comments', function (Blueprint $table) {
            if (! Schema::hasColumn('community_post_comments', 'image_path')) {
                $table->string('image_path')->nullable()->after('body');
            }

            if (! Schema::hasColumn('community_post_comments', 'image_url')) {
                $table->string('image_url', 2048)->nullable()->after('image_path');
            }
        });
    }

    public function down(): void
    {
        // Repair migration — no rollback.
    }
};
