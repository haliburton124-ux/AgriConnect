<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Idempotent schema repairs for databases restored from SQL dumps where the
 * migrations table says "already migrated" but column definitions are stale.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('users')) {
            return;
        }

        if (! Schema::hasColumn('users', 'suffix')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('suffix', 20)->nullable()->after('last_name');
            });
        }

        if (! Schema::hasColumn('users', 'is_archived')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('is_archived')->default(false);
                $table->timestamp('archived_at')->nullable();
                $table->foreignId('archived_by')->nullable()->constrained('users')->nullOnDelete();
            });
        }

        // OTP hashes are ~60 chars; the original column was VARCHAR(10).
        DB::statement('ALTER TABLE users MODIFY otp_code VARCHAR(255) NULL');
    }

    public function down(): void
    {
        // Repair migration — no rollback.
    }
};
