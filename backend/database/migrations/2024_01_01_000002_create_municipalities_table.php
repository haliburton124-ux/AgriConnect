<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('municipalities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('province_id')->constrained('provinces')->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('psgc_code', 20)->unique()->nullable();
            $table->enum('type', ['city', 'municipality'])->default('municipality');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->json('boundary_geojson')->nullable();
            $table->timestamps();

            $table->unique(['province_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('municipalities');
    }
};
