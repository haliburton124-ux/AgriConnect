<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('incident_id')->nullable()->constrained('incidents')->nullOnDelete();
            $table->foreignId('farmer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('technician_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('farm_id')->nullable()->constrained('farms')->nullOnDelete();
            $table->dateTime('scheduled_at');
            $table->string('purpose', 200)->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])->default('scheduled');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
