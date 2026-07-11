<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->string('visibility', 30)->default('personal')->after('category');
            $table->foreignId('municipality_id')->nullable()->after('visibility')->constrained('municipalities')->nullOnDelete();
        });

        DB::statement("ALTER TABLE documents MODIFY category VARCHAR(50) NOT NULL DEFAULT 'other'");
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropConstrainedForeignId('municipality_id');
            $table->dropColumn('visibility');
        });
    }
};
