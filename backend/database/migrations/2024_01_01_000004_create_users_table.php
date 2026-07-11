<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('middle_name', 100)->nullable();
            $table->string('email')->unique();
            $table->string('phone', 20)->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('phone_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', [
                'admin',
                'provincial_office',
                'municipal_office',
                'technician',
                'farmer',
            ])->default('farmer')->index();
            $table->foreignId('municipality_id')->nullable()->constrained('municipalities')->nullOnDelete();
            $table->foreignId('barangay_id')->nullable()->constrained('barangays')->nullOnDelete();
            $table->string('avatar_path')->nullable();
            $table->enum('status', ['active', 'inactive', 'suspended', 'pending'])->default('pending')->index();
            $table->boolean('two_factor_enabled')->default(false);
            $table->string('two_factor_secret')->nullable();
            $table->string('otp_code', 10)->nullable();
            $table->timestamp('otp_expires_at')->nullable();
            $table->rememberToken();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
