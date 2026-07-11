<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incident_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('incident_id')->constrained('incidents')->cascadeOnDelete();
            $table->foreignId('changed_by')->constrained('users')->restrictOnDelete();
            $table->string('from_status', 30)->nullable();
            $table->string('to_status', 30);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incident_status_histories');
    }
};
