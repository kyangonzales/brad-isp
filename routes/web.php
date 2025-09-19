<?php

use App\Http\Controllers\PlanController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\HistoryController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('customer', function () {
        return Inertia::render('customer/index');
    })->name('customer');

    // Route::get('/customers/{id}/info', function () {
    //     return Inertia::render('customer/info');
    // })->name('/customers/info');

    Route::get('/customers/{id}/info', [CustomerController::class, 'show'])->name('customers.info');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('plans', function () {
        return Inertia::render('plans');
    })->name('plans');
});


Route::middleware('auth')->group(function () {
    Route::post('/insertCustomer', [CustomerController::class, 'store']);
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::put('/updateCustomer/{id}', [CustomerController::class, 'update']);
    Route::put('/updateNotes/{id}', [CustomerController::class, 'updateNotes']);
    Route::put('/updateState/{id}', [CustomerController::class, 'updateState']);
    Route::post('/plans', [PlanController::class, 'store']);
    Route::get('/showPlans', [PlanController::class, 'index']);
    Route::delete('/plans/{id}', [PlanController::class, 'destroy']);
    Route::put('/plans/{id}', [PlanController::class, 'update']);
    Route::post('/saveHistory', [HistoryController::class, 'store']);
});

Route::get('/plans/{planId}/subscribers', [PlanController::class, 'getSubscribers']);

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
