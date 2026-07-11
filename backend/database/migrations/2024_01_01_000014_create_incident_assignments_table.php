<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incident_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('incident_id')->constrained('incidents')->cascadeOnDelete();
            $table->foreignId('technician_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assigned_by')->constrained('users')->restrictOnDelete();
            $table->enum('status', ['assigned', 'accepted', 'in_progress', 'completed', 'reassigned'])->default('assigned');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incident_assignments');
    }
};
