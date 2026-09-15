<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('appointments', 'completion_findings')) {
            Schema::table('appointments', function (Blueprint $table) {
                $table->text('completion_findings')->nullable()->after('notes');
            });
        }

        if (! Schema::hasColumn('appointments', 'completion_outcome')) {
            Schema::table('appointments', function (Blueprint $table) {
                $table->text('completion_outcome')->nullable()->after('completion_findings');
            });
        }

        if (! Schema::hasColumn('appointments', 'completion_follow_up')) {
            Schema::table('appointments', function (Blueprint $table) {
                $table->text('completion_follow_up')->nullable()->after('completion_outcome');
            });
        }
    }

    public function down(): void
    {
        $drop = array_values(array_filter([
            Schema::hasColumn('appointments', 'completion_findings') ? 'completion_findings' : null,
            Schema::hasColumn('appointments', 'completion_outcome') ? 'completion_outcome' : null,
            Schema::hasColumn('appointments', 'completion_follow_up') ? 'completion_follow_up' : null,
        ]));

        if ($drop !== []) {
            Schema::table('appointments', function (Blueprint $table) use ($drop) {
                $table->dropColumn($drop);
            });
        }
    }
};
