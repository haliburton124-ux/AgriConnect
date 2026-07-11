<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RoleUserSeeder extends Seeder
{
    /**
     * Seeds one account per role for demo/testing purposes:
     * - System Admin
     * - Provincial Agriculture Office
     * - Municipal Agriculture Office (per sample municipality)
     * - Agricultural Technicians
     * - Farmers
     *
     * Default password for ALL seeded accounts: Password123!
     */
    public function run(): void
    {
        $password = Hash::make('Password123!');
        $municipalities = DB::table('municipalities')->get();
        $laoag = $municipalities->firstWhere('name', 'Laoag City');
        $laoagBarangay = DB::table('barangays')->where('municipality_id', $laoag->id)->first();

        // System Admin
        DB::table('users')->insert([
            'first_name' => 'System', 'last_name' => 'Administrator',
            'email' => 'admin@agriri.gov.ph', 'phone' => '09170000001',
            'password' => $password, 'role' => 'admin',
            'status' => 'active', 'email_verified_at' => now(),
            'created_at' => now(), 'updated_at' => now(),
        ]);

        // Provincial Agriculture Office
        DB::table('users')->insert([
            'first_name' => 'Provincial', 'last_name' => 'Agriculturist',
            'email' => 'ppo@agriri.gov.ph', 'phone' => '09170000002',
            'password' => $password, 'role' => 'provincial_office',
            'status' => 'active', 'email_verified_at' => now(),
            'created_at' => now(), 'updated_at' => now(),
        ]);

        // One Municipal Agriculture Office account per municipality
        foreach ($municipalities as $muni) {
            $slug = strtolower(str_replace([' ', '.'], ['', ''], $muni->name));
            DB::table('users')->insert([
                'first_name' => 'MAO', 'last_name' => $muni->name,
                'email' => "mao.{$slug}@agriri.gov.ph",
                'phone' => '09170001'.str_pad((string) $muni->id, 3, '0', STR_PAD_LEFT),
                'password' => $password, 'role' => 'municipal_office',
                'municipality_id' => $muni->id,
                'status' => 'active', 'email_verified_at' => now(),
                'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        // Sample technicians assigned to Laoag City
        for ($i = 1; $i <= 3; $i++) {
            $userId = DB::table('users')->insertGetId([
                'first_name' => 'Technician', 'last_name' => "Cruz {$i}",
                'email' => "technician{$i}@agriri.gov.ph",
                'phone' => '09170002'.str_pad((string) $i, 3, '0', STR_PAD_LEFT),
                'password' => $password, 'role' => 'technician',
                'municipality_id' => $laoag->id, 'barangay_id' => $laoagBarangay->id,
                'status' => 'active', 'email_verified_at' => now(),
                'created_at' => now(), 'updated_at' => now(),
            ]);

            DB::table('technician_profiles')->insert([
                'user_id' => $userId,
                'license_number' => "AGT-2026-{$i}00{$i}",
                'specializations' => json_encode(['crop_disease', 'pest_infestation']),
                'assigned_municipality_id' => $laoag->id,
                'years_experience' => 2 + $i,
                'availability' => 'available',
                'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        // Sample farmers
        for ($i = 1; $i <= 5; $i++) {
            DB::table('users')->insert([
                'first_name' => 'Farmer', 'last_name' => "Dela Cruz {$i}",
                'email' => "farmer{$i}@agriri.gov.ph",
                'phone' => '09170003'.str_pad((string) $i, 3, '0', STR_PAD_LEFT),
                'password' => $password, 'role' => 'farmer',
                'municipality_id' => $laoag->id, 'barangay_id' => $laoagBarangay->id,
                'status' => 'active', 'email_verified_at' => now(),
                'created_at' => now(), 'updated_at' => now(),
            ]);
        }
    }
}
