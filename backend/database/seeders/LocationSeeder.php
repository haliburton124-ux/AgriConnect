<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LocationSeeder extends Seeder
{
    /**
     * Seeds the Province of Ilocos Norte and its 21 municipalities/cities
     * with a representative set of barangays for each.
     */
    public function run(): void
    {
        $provinceId = DB::table('provinces')->insertGetId([
            'name' => 'Ilocos Norte',
            'psgc_code' => '012800000',
            'latitude' => 18.1647,
            'longitude' => 120.7116,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 23 LGUs of Ilocos Norte: 2 cities (Laoag - capital, Batac) + 21 municipalities
        $municipalities = [
            'Adams', 'Bacarra', 'Badoc', 'Bangui', 'Banna', 'Batac City',
            'Burgos', 'Carasi', 'Currimao', 'Dingras', 'Dumalneg',
            'Laoag City', 'Marcos', 'Nueva Era', 'Pagudpud', 'Paoay',
            'Pasuquin', 'Piddig', 'Pinili', 'San Nicolas', 'Sarrat',
            'Solsona', 'Vintar',
        ];

        // Sample barangays per municipality (representative, not exhaustive).
        $sampleBarangays = ['Poblacion', 'San Jose', 'San Isidro', 'San Pedro', 'Santa Rosa', 'Bagumbayan'];

        foreach ($municipalities as $name) {
            $type = str_ends_with($name, 'City') ? 'city' : 'municipality';
            $cleanName = trim(str_replace('City', '', $name)) === $name ? $name : trim(str_replace(' City', '', $name));

            $municipalityId = DB::table('municipalities')->insertGetId([
                'province_id' => $provinceId,
                'name' => $name,
                'type' => $type,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($sampleBarangays as $brgy) {
                DB::table('barangays')->insert([
                    'municipality_id' => $municipalityId,
                    'name' => $brgy,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
