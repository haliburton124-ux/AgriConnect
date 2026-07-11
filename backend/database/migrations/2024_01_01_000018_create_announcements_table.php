<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('posted_by')->constrained('users')->cascadeOnDelete();
            $table->string('title', 200);
            $table->text('content');
            $table->string('cover_image_path')->nullable();
            $table->foreignId('municipality_id')->nullable()->constrained('municipalities')->nullOnDelete();
            $table->enum('audience', ['all', 'farmers', 'technicians', 'municipal_office'])->default('all');
            $table->boolean('is_published')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
