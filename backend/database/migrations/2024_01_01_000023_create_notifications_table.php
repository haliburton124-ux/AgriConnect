<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Laravel's built-in notifications table (database channel)
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        // Device tokens for Firebase Cloud Messaging push notifications
        Schema::create('device_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('fcm_token', 255);
            $table->enum('platform', ['android', 'ios', 'web'])->default('android');
            $table->timestamps();

            $table->unique(['user_id', 'fcm_token']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_tokens');
        Schema::dropIfExists('notifications');
    }
};
