<?php

namespace Database\Seeders;

use App\Models\KnowledgeArticle;
use App\Models\KnowledgeCategory;
use App\Models\Municipality;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LaoagKnowledgeArticleSeeder extends Seeder
{
    public function run(): void
    {
        $laoag = Municipality::query()->where('name', 'Laoag City')->first();
        $author = User::query()->where('email', 'mao.laoagcity@agriri.gov.ph')->first()
            ?? User::query()
                ->where('role', 'municipal_office')
                ->where('municipality_id', $laoag->id)
                ->first();

        if (! $laoag || ! $author) {
            return;
        }

        $categories = [];
        foreach ([
            'Crop Guides',
            'Pests & Diseases',
            'Farming Practices',
            'Weather & Climate',
            'Advisories',
            'Learning Materials',
        ] as $name) {
            $categories[$name] = KnowledgeCategory::query()->firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name],
            );
        }

        $samples = [
            [
                'slug' => 'laoag-kc-sample-rice-calendar',
                'title' => 'Rice transplanting calendar',
                'category' => 'Crop Guides',
                'cover' => 'https://images.unsplash.com/photo-1530053969600-caed259a2429?w=900&q=80',
                'published' => true,
                'published_at' => '2026-09-02 08:00:00',
                'content' => "Best windows for wet-season transplanting in Laoag lowlands and recommended seedling age for inbred and hybrid rice.\n\nTransplant 18–21 day-old seedlings when paddies hold 2–3 cm of standing water. Stagger planting by 7–10 days across fields so labor and irrigation demand stay manageable. Keep seedbeds near a reliable water source and harden seedlings 2 days before pulling.",
            ],
            [
                'slug' => 'laoag-kc-sample-rice-blast',
                'title' => 'Managing rice blast',
                'category' => 'Pests & Diseases',
                'cover' => 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=900&q=80',
                'published' => true,
                'published_at' => '2026-08-28 08:00:00',
                'content' => "Identify leaf lesions early and apply the recommended fungicide schedule for wet-season rice in Laoag City.\n\nWatch for diamond-shaped spots with gray centers on leaves, especially after long dew periods. Remove severely infected hills, avoid excess nitrogen, and follow MAO-recommended fungicide timing at tillering and panicle initiation. Report outbreaks to your assigned technician.",
            ],
            [
                'slug' => 'laoag-kc-sample-monsoon-watch',
                'title' => 'Southwest monsoon watch',
                'category' => 'Advisories',
                'cover' => 'https://images.unsplash.com/photo-1464226184884-fa280b87c0d3?w=900&q=80',
                'published' => false,
                'published_at' => null,
                'created_at' => '2026-08-20 08:00:00',
                'content' => "Delay fertilizer on flooded paddies until water recedes to avoid nutrient loss.\n\nWith habagat rains over Ilocos Norte, hold off topdressing while fields stay submerged. Drain to a thin film of water before applying urea, and check dikes after each heavy downpour. This draft is for MAO review before public release.",
            ],
            [
                'slug' => 'laoag-kc-sample-heat-irrigation',
                'title' => 'Heat and irrigation watch',
                'category' => 'Farming Practices',
                'cover' => 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=900&q=80',
                'published' => true,
                'published_at' => '2026-08-15 08:00:00',
                'content' => "Keep shallow standing water in Laoag rice fields during peak heat to reduce stress and lodging.\n\nIrrigate early morning or late afternoon. Avoid midday flooding on newly transplanted hills. Alternate wetting and drying only after the crop is well established, and coordinate pump schedules with neighboring farms along the same canal.",
            ],
        ];

        foreach ($samples as $sample) {
            $createdAt = $sample['created_at'] ?? $sample['published_at'] ?? now();

            KnowledgeArticle::query()->updateOrCreate(
                ['slug' => $sample['slug']],
                [
                    'category_id' => $categories[$sample['category']]->id,
                    'title' => $sample['title'],
                    'content' => $sample['content'],
                    'cover_image_path' => $sample['cover'],
                    'type' => 'article',
                    'author_id' => $author->id,
                    'municipality_id' => $laoag->id,
                    'is_published' => $sample['published'],
                    'published_at' => $sample['published_at'],
                    'view_count' => 0,
                    'is_archived' => false,
                    'created_at' => $createdAt,
                    'updated_at' => now(),
                ],
            );
        }
    }
}
