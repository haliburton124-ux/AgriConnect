<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('farm_boundaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained('farms')->cascadeOnDelete();
            // GeoJSON polygon drawn via Leaflet Draw, stored as JSON: {type: Polygon, coordinates: [...]}
            $table->json('geojson');
            $table->decimal('computed_area_hectares', 8, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('farm_boundaries');
    }
};
