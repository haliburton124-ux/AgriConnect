<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('technician_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('license_number', 100)->nullable();
            $table->json('specializations')->nullable();
            $table->foreignId('assigned_municipality_id')->nullable()->constrained('municipalities')->nullOnDelete();
            $table->integer('years_experience')->default(0);
            $table->enum('availability', ['available', 'busy', 'on_leave'])->default('available');
            $table->decimal('current_latitude', 10, 7)->nullable();
            $table->decimal('current_longitude', 10, 7)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('technician_profiles');
    }
};
