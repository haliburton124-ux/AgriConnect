<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('advisories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('issued_by')->constrained('users')->cascadeOnDelete();
            $table->string('title', 200);
            $table->text('content');
            $table->enum('type', ['weather', 'pest', 'disease', 'market', 'general'])->default('general');
            $table->enum('severity', ['info', 'advisory', 'warning', 'emergency'])->default('info');
            $table->foreignId('municipality_id')->nullable()->constrained('municipalities')->nullOnDelete();
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advisories');
    }
};
