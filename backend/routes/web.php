<?php

use App\Http\Controllers\StorageFileController;
use Illuminate\Support\Facades\Route;

Route::get('/storage/{path}', [StorageFileController::class, 'show'])
    ->where('path', '.*')
    ->name('storage.serve');

Route::get('/', function () {
    return response()->json([
        'name' => config('app.name'),
        'status' => 'ok',
    ]);
});
