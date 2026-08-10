<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('users') || ! Schema::hasColumn('users', 'is_archived')) {
            return;
        }

        DB::table('users')->whereNull('is_archived')->update(['is_archived' => false]);
    }

    public function down(): void
    {
        // Data repair — no rollback.
    }
};
