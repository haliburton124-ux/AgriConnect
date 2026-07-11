<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('municipality_id')->constrained('municipalities')->cascadeOnDelete();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 200);
            $table->text('content');
            $table->string('category', 50);
            $table->boolean('is_published')->default(true);
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->unsignedInteger('shares_count')->default(0);
            $table->timestamps();

            $table->index(['is_published', 'category', 'created_at']);
        });

        Schema::create('community_post_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('community_post_id')->constrained('community_posts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['community_post_id', 'user_id']);
        });

        Schema::create('community_post_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('community_post_id')->constrained('community_posts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('community_post_comments')->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();
        });

        Schema::create('community_post_shares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('community_post_id')->constrained('community_posts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['community_post_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('community_post_shares');
        Schema::dropIfExists('community_post_comments');
        Schema::dropIfExists('community_post_likes');
        Schema::dropIfExists('community_posts');
    }
};
