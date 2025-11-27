<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route::get('/', function () {
// 	return Inertia::render('Welcome', [
// 		'canLogin' => Route::has('login'),
// 		'canRegister' => Route::has('register'),
// 		'laravelVersion' => Application::VERSION,
// 		'phpVersion' => PHP_VERSION,
// 	]);
// });

Route::redirect('/', '/cars');

Route::get('/sync-data', function () {
	return Inertia::render('SyncData');
})->middleware(['auth', 'verified'])->name('sync-data');

Route::middleware('auth')->group(function () {
	Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
	Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
	Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

	// Users CRUD routes
	Route::resource('users', \App\Http\Controllers\UserController::class);

	// Cars CRUD routes
	Route::resource('cars', \App\Http\Controllers\CarController::class)->only(['index', 'show']);

	// Quotes CRUD routes
	Route::resource('quotes', \App\Http\Controllers\QuoteController::class)->only(['index', 'show']);

	// Sync API data route
	Route::post('/sync-data', [\App\Http\Controllers\SyncApiController::class, 'sync'])->name('sync.data');
});

require __DIR__ . '/auth.php';
