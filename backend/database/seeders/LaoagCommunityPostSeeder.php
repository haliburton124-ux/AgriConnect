<?php

namespace Database\Seeders;

use App\Models\CommunityPost;
use App\Models\Municipality;
use App\Models\User;
use Illuminate\Database\Seeder;

class LaoagCommunityPostSeeder extends Seeder
{
    public function run(): void
    {
        $laoag = Municipality::query()->where('name', 'Laoag City')->first();
        $author = User::query()->where('email', 'mao.laoagcity@agriri.gov.ph')->first()
            ?? User::query()
                ->where('role', 'municipal_office')
                ->where('municipality_id', $laoag?->id)
                ->first();

        if (! $laoag || ! $author) {
            return;
        }

        $samples = [
            [
                'title' => 'Hold fertilizer until floodwater recedes',
                'content' => 'Farmers in low-lying barangays: hold off on fertilizer until floodwater recedes. Inspect seedlings for fungal spots before the next application.',
                'category' => 'weather_advisory',
                'image' => 'https://images.unsplash.com/photo-1530053969600-caed259a2429?w=1200&q=80',
                'likes' => 24,
                'comments' => 6,
                'shares' => 3,
                'created_at' => '2026-09-05 08:00:00',
            ],
            [
                'title' => 'Fall armyworm sighted near Barangay 12',
                'content' => 'Fall armyworm sighted in corn plots near Brgy. 12. Report unusual leaf damage through Incidents so technicians can inspect promptly.',
                'category' => 'pest_outbreak',
                'image' => 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80',
                'likes' => 41,
                'comments' => 11,
                'shares' => 8,
                'created_at' => '2026-09-04 08:00:00',
            ],
            [
                'title' => 'Wet-season transplanting window for Laoag lowlands',
                'content' => 'Transplant 18–21 day-old rice seedlings while paddies hold a thin film of water. Stagger planting by a week so irrigation demand stays manageable.',
                'category' => 'planting_calendar',
                'image' => 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
                'likes' => 18,
                'comments' => 4,
                'shares' => 5,
                'created_at' => '2026-09-03 08:00:00',
            ],
            [
                'title' => 'Irrigate early during the heat spell',
                'content' => 'Apply irrigation at dawn or late afternoon this week. Avoid midday flooding on newly transplanted hills to reduce heat stress and lodging.',
                'category' => 'irrigation',
                'image' => 'https://images.unsplash.com/photo-1464226184884-fa280b87c0d3?w=1200&q=80',
                'likes' => 15,
                'comments' => 2,
                'shares' => 4,
                'created_at' => '2026-09-02 08:00:00',
            ],
        ];

        foreach ($samples as $sample) {
            CommunityPost::query()->updateOrCreate(
                [
                    'municipality_id' => $laoag->id,
                    'title' => $sample['title'],
                ],
                [
                    'author_id' => $author->id,
                    'content' => $sample['content'],
                    'category' => $sample['category'],
                    'image_path' => $sample['image'],
                    'is_published' => true,
                    'is_archived' => false,
                    'likes_count' => $sample['likes'],
                    'comments_count' => $sample['comments'],
                    'shares_count' => $sample['shares'],
                    'created_at' => $sample['created_at'],
                    'updated_at' => now(),
                ],
            );
        }
    }
}
