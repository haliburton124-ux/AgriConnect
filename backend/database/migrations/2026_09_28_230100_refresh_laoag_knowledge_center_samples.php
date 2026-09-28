<?php

use Database\Seeders\LaoagKnowledgeArticleSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        (new LaoagKnowledgeArticleSeeder)->run();
    }

    public function down(): void
    {
        // Samples remain until the original Laoag knowledge seeder is rolled back.
    }
};
