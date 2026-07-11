<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->text('description');
            $table->string('cover_image_path')->nullable();
            $table->enum('category', ['subsidy', 'training', 'loan', 'seedling', 'equipment', 'insurance', 'other'])->default('other');
            $table->date('application_start')->nullable();
            $table->date('application_end')->nullable();
            $table->json('eligibility_criteria')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('program_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('programs')->cascadeOnDelete();
            $table->foreignId('farmer_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['submitted', 'under_review', 'approved', 'rejected'])->default('submitted');
            $table->text('remarks')->nullable();
            $table->json('document_paths')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_applications');
        Schema::dropIfExists('programs');
    }
};
