<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incidents', function (Blueprint $table) {
            $table->id();
            $table->string('reference_code', 30)->unique(); // e.g. AGC-2026-000123
            $table->foreignId('farmer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('farm_id')->nullable()->constrained('farms')->nullOnDelete();
            $table->foreignId('category_id')->constrained('incident_categories')->restrictOnDelete();
            $table->foreignId('municipality_id')->constrained('municipalities')->restrictOnDelete();
            $table->foreignId('barangay_id')->constrained('barangays')->restrictOnDelete();

            $table->string('title', 200);
            $table->text('description');
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium')->index();

            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);

            $table->date('incident_date');
            $table->text('remarks')->nullable();

            $table->enum('status', [
                'pending', 'validated', 'assigned', 'ongoing', 'resolved', 'rejected',
            ])->default('pending')->index();

            $table->foreignId('assigned_technician_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('validated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('validated_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->text('rejection_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['municipality_id', 'status']);
            $table->index(['barangay_id', 'status']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};
