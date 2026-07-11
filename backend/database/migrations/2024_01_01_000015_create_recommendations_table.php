<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('incident_id')->constrained('incidents')->cascadeOnDelete();
            $table->foreignId('technician_id')->constrained('users')->cascadeOnDelete();
            $table->text('inspection_notes')->nullable();
            $table->text('treatment_recommendation')->nullable();
            $table->text('follow_up_actions')->nullable();
            $table->json('attachment_paths')->nullable();
            $table->boolean('requires_follow_up')->default(false);
            $table->date('follow_up_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recommendations');
    }
};
