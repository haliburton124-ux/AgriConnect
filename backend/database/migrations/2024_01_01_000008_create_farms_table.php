<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('farms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farmer_id')->constrained('users')->cascadeOnDelete();
            $table->string('farm_name', 150);
            $table->foreignId('municipality_id')->constrained('municipalities')->restrictOnDelete();
            $table->foreignId('barangay_id')->constrained('barangays')->restrictOnDelete();
            $table->text('address')->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->decimal('area_hectares', 8, 2)->nullable();
            $table->enum('farm_type', [
                'rice', 'corn', 'vegetable', 'fruit', 'livestock',
                'poultry', 'fishery', 'mixed', 'other',
            ])->default('rice');
            $table->string('primary_crop', 100)->nullable();
            $table->enum('ownership_status', ['owned', 'leased', 'tenant', 'other'])->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('farms');
    }
};
