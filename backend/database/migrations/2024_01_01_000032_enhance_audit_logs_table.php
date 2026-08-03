<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->string('module', 80)->nullable()->after('action');
            $table->text('description')->nullable()->after('module');
            $table->string('user_role', 40)->nullable()->after('user_id');
            $table->foreignId('municipality_id')->nullable()->after('user_role')->constrained('municipalities')->nullOnDelete();

            $table->index('module');
            $table->index('user_role');
            $table->index('municipality_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('municipality_id');
            $table->dropColumn(['module', 'description', 'user_role']);
        });
    }
};
