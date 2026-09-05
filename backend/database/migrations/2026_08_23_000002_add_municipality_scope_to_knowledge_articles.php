<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('knowledge_articles', function (Blueprint $table) {
            $table->foreignId('municipality_id')
                ->nullable()
                ->after('author_id')
                ->constrained()
                ->nullOnDelete();
            $table->timestamp('published_at')->nullable()->after('is_published');
            $table->json('attachments')->nullable()->after('pdf_path');
        });
    }

    public function down(): void
    {
        Schema::table('knowledge_articles', function (Blueprint $table) {
            $table->dropConstrainedForeignId('municipality_id');
            $table->dropColumn(['published_at', 'attachments']);
        });
    }
};
