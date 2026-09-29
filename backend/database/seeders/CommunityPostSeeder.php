<?php

namespace Database\Seeders;

use App\Models\Document;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CommunityPostSeeder extends Seeder
{
    public function run(): void
    {
        $mao = DB::table('users')->where('email', 'mao.laoagcity@agriri.gov.ph')->first();
        $laoag = DB::table('municipalities')->where('name', 'Laoag City')->first();

        if ($laoag && $mao) {
            (new LaoagCommunityPostSeeder)->run();
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
