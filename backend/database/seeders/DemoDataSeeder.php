<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DemoDataSeeder extends Seeder
{
    /**
     * Seeds sample farms and incidents so dashboards, maps, and
     * reports have realistic data to render out of the box.
     */
    public function run(): void
    {
        $farmers = DB::table('users')->where('role', 'farmer')->get();
        $technicians = DB::table('users')->where('role', 'technician')->get();
        $categories = DB::table('incident_categories')->get();
        $laoag = DB::table('municipalities')->where('name', 'Laoag City')->first();
        $barangay = DB::table('barangays')->where('municipality_id', $laoag->id)->first();

        // Approximate bounding box around Laoag City, Ilocos Norte
        $baseLat = 18.1978;
        $baseLng = 120.5931;

        $farmIds = [];
        foreach ($farmers as $index => $farmer) {
            $lat = $baseLat + (mt_rand(-50, 50) / 1000);
            $lng = $baseLng + (mt_rand(-50, 50) / 1000);

            $farmId = DB::table('farms')->insertGetId([
                'farmer_id' => $farmer->id,
                'farm_name' => "{$farmer->last_name} Farm",
                'municipality_id' => $laoag->id,
                'barangay_id' => $barangay->id,
                'address' => "Brgy. {$barangay->name}, Laoag City, Ilocos Norte",
                'latitude' => $lat,
                'longitude' => $lng,
                'area_hectares' => mt_rand(1, 10) + (mt_rand(0, 99) / 100),
                'farm_type' => ['rice', 'corn', 'vegetable'][array_rand(['rice', 'corn', 'vegetable'])],
                'primary_crop' => 'Rice',
                'ownership_status' => 'owned',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $farmIds[] = ['farm_id' => $farmId, 'farmer_id' => $farmer->id, 'lat' => $lat, 'lng' => $lng];
        }

        $statuses = ['pending', 'validated', 'assigned', 'ongoing', 'resolved'];
        $severities = ['low', 'medium', 'high', 'critical'];

        foreach ($farmIds as $i => $farm) {
            $status = $statuses[$i % count($statuses)];
            $category = $categories->random();
            $technician = $technicians->random();

            $incidentId = DB::table('incidents')->insertGetId([
                'reference_code' => 'AGC-2026-'.str_pad((string) ($i + 1), 6, '0', STR_PAD_LEFT),
                'farmer_id' => $farm['farmer_id'],
                'farm_id' => $farm['farm_id'],
                'category_id' => $category->id,
                'municipality_id' => $laoag->id,
                'barangay_id' => $barangay->id,
                'title' => "{$category->name} reported on farm",
                'description' => "Farmer observed signs of {$category->name} affecting a portion of the field. Requesting technical assistance and inspection.",
                'severity' => $severities[array_rand($severities)],
                'latitude' => $farm['lat'],
                'longitude' => $farm['lng'],
                'incident_date' => now()->subDays(mt_rand(0, 14)),
                'status' => $status,
                'assigned_technician_id' => in_array($status, ['assigned', 'ongoing', 'resolved']) ? $technician->id : null,
                'created_at' => now()->subDays(mt_rand(0, 14)),
                'updated_at' => now(),
            ]);

            DB::table('incident_status_histories')->insert([
                'incident_id' => $incidentId,
                'changed_by' => $farm['farmer_id'],
                'from_status' => null,
                'to_status' => 'pending',
                'notes' => 'Incident submitted by farmer.',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
