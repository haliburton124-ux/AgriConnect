<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Re-sync official barangay sort order from the Ilocos Norte dataset and remove
     * legacy orphan rows (null sort_order) such as duplicate "San Jose", "San Isidro",
     * and "Bagumbayan" entries that were incorrectly linked to Laoag City.
     */
    public function up(): void
    {
        $barangayDataPath = database_path('data/ilocos_norte_barangays.json');
        $barangayData = json_decode(file_get_contents($barangayDataPath), true);

        if (! is_array($barangayData)) {
            throw new RuntimeException('Could not load Ilocos Norte barangay data.');
        }

        $province = DB::table('provinces')->where('name', 'Ilocos Norte')->first();

        if (! $province) {
            return;
        }

        foreach ($barangayData as $municipalityName => $barangays) {
            $municipality = DB::table('municipalities')
                ->where('province_id', $province->id)
                ->where('name', $municipalityName)
                ->first();

            if (! $municipality) {
                continue;
            }

            $officialNames = array_flip($barangays);

            foreach ($barangays as $index => $name) {
                DB::table('barangays')->updateOrInsert(
                    ['municipality_id' => $municipality->id, 'name' => $name],
                    [
                        'sort_order' => $index + 1,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ],
                );
            }

            $existingBarangays = DB::table('barangays')
                ->where('municipality_id', $municipality->id)
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

    public function down(): void
    {
        // Reference-data cleanup is not reversed.
    }
};
