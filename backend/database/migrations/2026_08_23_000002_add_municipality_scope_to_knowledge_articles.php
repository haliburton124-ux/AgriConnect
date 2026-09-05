<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('knowledge_articles', 'municipality_id')) {
            Schema::table('knowledge_articles', function (Blueprint $table) {
                $table->foreignId('municipality_id')
                    ->nullable()
                    ->after('author_id')
                    ->constrained()
                    ->nullOnDelete();
            });
        }

        if (! Schema::hasColumn('knowledge_articles', 'published_at')) {
            Schema::table('knowledge_articles', function (Blueprint $table) {
                $table->timestamp('published_at')->nullable()->after('is_published');
            });
        }

        if (! Schema::hasColumn('knowledge_articles', 'attachments')) {
            Schema::table('knowledge_articles', function (Blueprint $table) {
                $table->json('attachments')->nullable()->after('pdf_path');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('knowledge_articles', 'municipality_id')) {
            Schema::table('knowledge_articles', function (Blueprint $table) {
                $table->dropConstrainedForeignId('municipality_id');
            });
        }

        $drop = array_values(array_filter([
            Schema::hasColumn('knowledge_articles', 'published_at') ? 'published_at' : null,
            Schema::hasColumn('knowledge_articles', 'attachments') ? 'attachments' : null,
        ]));

        if ($drop !== []) {
            Schema::table('knowledge_articles', function (Blueprint $table) use ($drop) {
                $table->dropColumn($drop);
            });
        }
    }
};
