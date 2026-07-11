<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 200);
            $table->string('file_path');
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->enum('category', ['land_title', 'certification', 'id', 'permit', 'other'])->default('other');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
