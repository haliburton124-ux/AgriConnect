<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class IncidentCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Crop Disease', 'icon' => 'leaf', 'color' => '#D32F2F'],
            ['name' => 'Pest Infestation', 'icon' => 'bug', 'color' => '#F9A825'],
            ['name' => 'Livestock', 'icon' => 'cow', 'color' => '#6D4C41'],
            ['name' => 'Irrigation', 'icon' => 'droplet', 'color' => '#0288D1'],
            ['name' => 'Flood', 'icon' => 'waves', 'color' => '#1565C0'],
            ['name' => 'Typhoon', 'icon' => 'wind', 'color' => '#37474F'],
            ['name' => 'Drought', 'icon' => 'sun', 'color' => '#EF6C00'],
            ['name' => 'Fire', 'icon' => 'flame', 'color' => '#E53935'],
            ['name' => 'Others', 'icon' => 'alert-circle', 'color' => '#616161'],
        ];

        foreach ($categories as $cat) {
            DB::table('incident_categories')->insert([
                'name' => $cat['name'],
                'slug' => Str::slug($cat['name']),
                'icon' => $cat['icon'],
                'color' => $cat['color'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
