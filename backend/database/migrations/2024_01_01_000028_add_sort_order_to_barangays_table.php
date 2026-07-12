<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barangays', function (Blueprint $table) {
            $table->unsignedSmallInteger('sort_order')->nullable()->after('name');
            $table->index(['municipality_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::table('barangays', function (Blueprint $table) {
            $table->dropIndex(['municipality_id', 'sort_order']);
            $table->dropColumn('sort_order');
        });
    }
};
