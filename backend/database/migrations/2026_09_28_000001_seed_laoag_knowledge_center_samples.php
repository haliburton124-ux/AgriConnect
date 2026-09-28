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
        \Illuminate\Support\Facades\DB::table('knowledge_articles')
            ->whereIn('slug', [
                'laoag-kc-sample-rice-calendar',
                'laoag-kc-sample-rice-blast',
                'laoag-kc-sample-monsoon-watch',
                'laoag-kc-sample-heat-irrigation',
                'laoag-kc-sample-planthopper',
                'laoag-kc-sample-garlic-onion',
            ])
            ->delete();
    }
};
