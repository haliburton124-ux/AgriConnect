<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $tables = [
        'users',
        'farms',
        'incidents',
        'announcements',
        'advisories',
        'community_posts',
        'documents',
        'knowledge_articles',
        'programs',
    ];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->boolean('is_archived')->default(false);
                $table->timestamp('archived_at')->nullable();
                $table->foreignId('archived_by')->nullable()->constrained('users')->nullOnDelete();
            });
        }

        foreach (['users', 'farms', 'incidents'] as $table) {
            DB::table($table)
                ->whereNotNull('deleted_at')
                ->update([
                    'is_archived' => true,
                    'archived_at' => DB::raw('deleted_at'),
                ]);

            Schema::table($table, function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }

    public function down(): void
    {
        foreach (['users', 'farms', 'incidents'] as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->softDeletes();
            });

            DB::table($table)
                ->where('is_archived', true)
                ->update(['deleted_at' => DB::raw('archived_at')]);
        }

        foreach (array_reverse($this->tables) as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->dropConstrainedForeignId('archived_by');
                $table->dropColumn(['is_archived', 'archived_at']);
            });
        }
    }
};
