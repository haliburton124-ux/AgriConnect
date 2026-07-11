<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            LocationSeeder::class,
            IncidentCategorySeeder::class,
            RoleUserSeeder::class,
            DemoDataSeeder::class,
            CommunityPostSeeder::class,
        ]);
    }
}
