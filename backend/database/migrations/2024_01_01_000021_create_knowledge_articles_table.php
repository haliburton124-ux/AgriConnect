<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('knowledge_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->timestamps();
        });

        Schema::create('knowledge_articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('knowledge_categories')->nullOnDelete();
            $table->string('title', 200);
            $table->string('slug', 220)->unique();
            $table->longText('content');
            $table->string('cover_image_path')->nullable();
            $table->enum('type', ['article', 'video', 'faq', 'pdf_guide'])->default('article');
            $table->string('video_url')->nullable();
            $table->string('pdf_path')->nullable();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->boolean('is_published')->default(true);
            $table->unsignedInteger('view_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_articles');
        Schema::dropIfExists('knowledge_categories');
    }
};
