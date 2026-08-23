<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->foreignId('municipality_id')
                ->nullable()
                ->after('created_by')
                ->constrained()
                ->nullOnDelete();
        });

        Schema::table('knowledge_articles', function (Blueprint $table) {
            $table->foreignId('municipality_id')
                ->nullable()
                ->after('author_id')
                ->constrained()
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('municipality_id');
        });

        Schema::table('knowledge_articles', function (Blueprint $table) {
            $table->dropConstrainedForeignId('municipality_id');
        });
    }
};
