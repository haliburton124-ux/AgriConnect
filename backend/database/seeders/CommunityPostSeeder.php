<?php

namespace Database\Seeders;

use App\Models\CommunityPost;
use App\Models\Document;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CommunityPostSeeder extends Seeder
{
    public function run(): void
    {
        $mao = DB::table('users')->where('email', 'mao.laoagcity@agriri.gov.ph')->first();
        $batacMao = DB::table('users')
            ->where('role', 'municipal_office')
            ->where('email', 'like', '%batac%')
            ->first();

        $laoag = DB::table('municipalities')->where('name', 'Laoag City')->first();
        $batac = DB::table('municipalities')->where('name', 'Batac City')->first();

        if (! $mao || ! $laoag) {
            return;
        }

        $posts = [
            [
                'municipality_id' => $laoag->id,
                'author_id' => $mao->id,
                'title' => 'Proper Pesticide Application for Rice Fields',
                'content' => "Apply pesticides during early morning or late afternoon to reduce evaporation and drift. Always wear protective equipment and observe the pre-harvest interval indicated on the product label.\n\nFor brown planthopper outbreaks, consult your municipal technician before switching active ingredients to avoid resistance buildup.",
                'category' => 'pesticide_usage',
            ],
            [
                'municipality_id' => $laoag->id,
                'author_id' => $mao->id,
                'title' => 'Managing Sheath Blight in Corn',
                'content' => 'Sheath blight appears as oval lesions on lower leaves. Improve field drainage, avoid excessive nitrogen, and remove infected stubble after harvest. Fungicide treatment is most effective when lesions are still limited to the lower canopy.',
                'category' => 'crop_disease',
            ],
            [
                'municipality_id' => $laoag->id,
                'author_id' => $mao->id,
                'title' => 'Dry Season Planting Calendar — Ilocos Norte',
                'content' => "November–December: Land preparation and seedbed establishment.\nJanuary–February: Transplanting for irrigated rice.\nMarch: Side-dress fertilizer and irrigation monitoring.\n\nAdjust dates based on your barangay water schedule.",
                'category' => 'planting_calendar',
            ],
        ];

        if ($batac && $batacMao) {
            $posts[] = [
                'municipality_id' => $batac->id,
                'author_id' => $batacMao->id,
                'title' => 'Suitable Crops for Sandy Loam Soils',
                'content' => 'Sandy loam areas in Batac respond well to garlic, shallots, and mungbean during the dry season. Incorporate organic matter before planting to improve moisture retention.',
                'category' => 'suitable_crops',
            ];
        } else {
            $posts[] = [
                'municipality_id' => $laoag->id,
                'author_id' => $mao->id,
                'title' => 'Suitable Crops for Sandy Loam Soils',
                'content' => 'Sandy loam areas respond well to garlic, shallots, and mungbean during the dry season. Incorporate organic matter before planting to improve moisture retention.',
                'category' => 'suitable_crops',
            ];
        }

        foreach ($posts as $post) {
            CommunityPost::create(array_merge($post, ['is_published' => true]));
        }

        if ($mao && $laoag) {
            Document::create([
                'user_id' => $mao->id,
                'municipality_id' => $laoag->id,
                'title' => 'Internal Memo — Q1 Pest Monitoring Schedule',
                'file_path' => 'municipality-documents/sample-memo.pdf',
                'mime_type' => 'application/pdf',
                'size_bytes' => 1024,
                'category' => 'memorandum',
                'visibility' => Document::VISIBILITY_MUNICIPALITY,
            ]);
        }
    }
}
