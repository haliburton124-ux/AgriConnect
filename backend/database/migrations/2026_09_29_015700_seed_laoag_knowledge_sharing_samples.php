<?php

use Database\Seeders\LaoagCommunityPostSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        (new LaoagCommunityPostSeeder)->run();
    }

    public function down(): void
    {
        \Illuminate\Support\Facades\DB::table('community_posts')
            ->whereIn('title', [
                'Hold fertilizer until floodwater recedes',
                'Fall armyworm sighted near Barangay 12',
                'Wet-season transplanting window for Laoag lowlands',
                'Irrigate early during the heat spell',
            ])
            ->delete();
    }
};
