<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LocationSeeder extends Seeder
{
    /**
     * Seeds the Province of Ilocos Norte, its 23 municipalities/cities,
     * and the official barangay list for each LGU in dataset order.
     */
    public function run(): void
    {
        $barangayDataPath = database_path('data/ilocos_norte_barangays.json');
        $barangayData = json_decode(file_get_contents($barangayDataPath), true);

        if (! is_array($barangayData)) {
            throw new \RuntimeException('Could not load Ilocos Norte barangay data.');
        }

        $province = DB::table('provinces')->where('name', 'Ilocos Norte')->first();

        if (! $province) {
            $provinceId = DB::table('provinces')->insertGetId([
                'name' => 'Ilocos Norte',
                'psgc_code' => '012800000',
                'latitude' => 18.1647,
                'longitude' => 120.7116,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $provinceId = $province->id;
        }

        foreach ($barangayData as $municipalityName => $barangays) {
            $type = str_ends_with($municipalityName, 'City') ? 'city' : 'municipality';

            $municipality = DB::table('municipalities')
                ->where('province_id', $provinceId)
                ->where('name', $municipalityName)
                ->first();

            if ($municipality) {
                $municipalityId = $municipality->id;
                DB::table('municipalities')->where('id', $municipalityId)->update([
                    'type' => $type,
                    'updated_at' => now(),
                ]);
            } else {
                $municipalityId = DB::table('municipalities')->insertGetId([
                    'province_id' => $provinceId,
                    'name' => $municipalityName,
                    'type' => $type,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $officialNames = array_flip($barangays);

            foreach ($barangays as $index => $name) {
                DB::table('barangays')->updateOrInsert(
                    ['municipality_id' => $municipalityId, 'name' => $name],
                    [
                        'sort_order' => $index + 1,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ],
                );
            }

            $existingBarangays = DB::table('barangays')
                ->where('municipality_id', $municipalityId)
                ->get(['id', 'name']);

            foreach ($existingBarangays as $existingBarangay) {
                if (isset($officialNames[$existingBarangay->name])) {
                    continue;
                }

                DB::table('barangays')
                    ->where('id', $existingBarangay->id)
                    ->update(['sort_order' => null, 'updated_at' => now()]);

                $inUse = DB::table('users')->where('barangay_id', $existingBarangay->id)->exists()
                    || DB::table('farms')->where('barangay_id', $existingBarangay->id)->exists()
                    || DB::table('incidents')->where('barangay_id', $existingBarangay->id)->exists();

                if (! $inUse) {
                    DB::table('barangays')->where('id', $existingBarangay->id)->delete();
                }
            }
        }
    }
}
