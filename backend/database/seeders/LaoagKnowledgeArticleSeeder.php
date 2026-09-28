<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class LaoagKnowledgeArticleSeeder extends Seeder
{
    public function run(): void
    {
        if (! Schema::hasTable('knowledge_articles') || ! Schema::hasTable('municipalities')) {
            return;
        }

        $laoag = DB::table('municipalities')->where('name', 'Laoag City')->first();
        if (! $laoag) {
            return;
        }

        $author = DB::table('users')
            ->where('role', 'municipal_office')
            ->where('municipality_id', $laoag->id)
            ->orderBy('id')
            ->first();

        if (! $author) {
            $author = DB::table('users')->where('email', 'mao.laoagcity@agriri.gov.ph')->first();
        }

        if (! $author) {
            return;
        }

        $categories = $this->ensureCategories();

        $now = now();
        $articles = [
            [
                'slug' => 'laoag-kc-sample-rice-calendar',
                'category' => 'Crop Guides',
                'title' => 'Wet-season rice calendar for Laoag City',
                'content' => "Municipal Agriculture Office — Laoag City\n\nUse this calendar as a guide for irrigated rice in Laoag barangays. Adjust a few days based on your water schedule and seed variety.\n\nMay–June: Complete land preparation, repair dikes, and establish the seedbed.\nJune–July: Transplant 18–21 day old seedlings at 20×20 cm spacing.\nJuly–August: First weeding and first nitrogen topdress. Watch for golden apple snail.\nAugust–September: Panicle initiation; keep the field flooded and scout twice a week for pests.\nOctober–November: Drain 7–10 days before harvest when 80–85% of grains are golden.\n\nBring damaged plants to the MAO office or contact your assigned technician for diagnosis.",
            ],
            [
                'slug' => 'laoag-kc-sample-planthopper',
                'category' => 'Pests & Diseases',
                'title' => 'Brown planthopper watch in Laoag rice fields',
                'content' => "Municipal Agriculture Office — Laoag City\n\nBrown planthopper (BPH) builds up quickly in continuously flooded fields, especially after heavy rains. Hopperburn starts as yellowing patches that turn brown from the center of the field.\n\nWhat farmers should do:\n1. Walk the field weekly and check the base of tillers, not only the leaf tips.\n2. Avoid spraying at the first few insects. Unnecessary insecticide kills spiders and mirid bugs that keep BPH down.\n3. Do not apply extra nitrogen after seeing hopperburn — lush growth makes the outbreak worse.\n4. Alternate wet and dry irrigation if your barangay water schedule allows it.\n\nIf hopperburn covers more than a few square meters, report it in AgriConnect so a technician can visit. Bring a sample of infested tillers to the Laoag MAO if you cannot wait for a field visit.",
            ],
            [
                'slug' => 'laoag-kc-sample-garlic-onion',
                'category' => 'Farming Practices',
                'title' => 'Dry-season garlic and onion tips for Laoag growers',
                'content' => "Municipal Agriculture Office — Laoag City\n\nGarlic and onion remain important dry-season crops in Ilocos Norte. In Laoag, plant after rice harvest once fields are drained and clods are broken down.\n\nLand preparation: Incorporate rice straw or compost two weeks before planting. Raised beds help in low-lying barangays that stay wet.\nPlanting: Use healthy, disease-free cloves or bulbs. Plant at 15×20 cm for garlic and 10×15 cm for onion, with the neck just above the soil.\nWater: Light irrigation at establishment, then every 7–10 days. Stop watering 2–3 weeks before harvest so bulbs cure in the field.\nPests: Watch for thrips during hot, dry weeks. Silvering of leaves is an early sign. Remove weeds that harbor thrips along dikes.\n\nThe MAO can help check seed quality and fertilizer timing. Do not apply unregistered pesticides close to harvest.",
            ],
            [
                'slug' => 'laoag-kc-sample-heat-irrigation',
                'category' => 'Weather & Climate',
                'title' => 'Heat and irrigation advisory for Laoag farms',
                'content' => "Municipal Agriculture Office — Laoag City\n\nHot, dry spells can stress rice, vegetables, and livestock around Laoag City. Follow these steps when daytime temperatures stay high and rainfall is delayed.\n\nCrops: Irrigate early morning or late afternoon. Mulch vegetable beds with rice straw to keep soil moisture. Avoid spraying pesticides at midday — plants scorch easily.\nRice: Keep a thin water layer; do not let fields crack for more than two days at tillering and flowering.\nAnimals: Provide shade and clean drinking water at all times. Watch for heat stress (panting, reduced feeding).\n\nListen to PAGASA updates and AgriConnect advisories. If your irrigation turnout is delayed, message your technician so the office can coordinate with the irrigators’ association.",
            ],
        ];

        foreach ($articles as $index => $article) {
            if (DB::table('knowledge_articles')->where('slug', $article['slug'])->exists()) {
                continue;
            }

            $row = [
                'category_id' => $categories[$article['category']] ?? null,
                'title' => $article['title'],
                'slug' => $article['slug'],
                'content' => $article['content'],
                'cover_image_path' => null,
                'type' => 'article',
                'video_url' => null,
                'pdf_path' => null,
                'author_id' => $author->id,
                'is_published' => true,
                'view_count' => 12 + ($index * 7),
                'created_at' => $now->copy()->subDays(8 - $index),
                'updated_at' => $now,
            ];

            if (Schema::hasColumn('knowledge_articles', 'municipality_id')) {
                $row['municipality_id'] = $laoag->id;
            }
            if (Schema::hasColumn('knowledge_articles', 'published_at')) {
                $row['published_at'] = $now->copy()->subDays(8 - $index);
            }
            if (Schema::hasColumn('knowledge_articles', 'attachments')) {
                $row['attachments'] = json_encode([]);
            }
            if (Schema::hasColumn('knowledge_articles', 'is_archived')) {
                $row['is_archived'] = false;
            }

            DB::table('knowledge_articles')->insert($row);
        }
    }

    /** @return array<string, int> */
    private function ensureCategories(): array
    {
        if (! Schema::hasTable('knowledge_categories')) {
            return [];
        }

        $names = [
            'Crop Guides',
            'Pests & Diseases',
            'Farming Practices',
            'Weather & Climate',
            'Advisories',
            'Learning Materials',
        ];

        $now = now();
        foreach ($names as $name) {
            $slug = Str::slug($name);
            $exists = DB::table('knowledge_categories')->where('slug', $slug)->exists();
            if (! $exists) {
                DB::table('knowledge_categories')->insert([
                    'name' => $name,
                    'slug' => $slug,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        return DB::table('knowledge_categories')->pluck('id', 'name')->all();
    }
}
