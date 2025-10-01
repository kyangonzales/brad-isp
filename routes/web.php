<?php

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\UserController;
use App\Http\Controllers\PlanController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\HistoryController;
use Illuminate\Support\Facades\Auth;

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
    Route::get('/customers/{id}/info', [CustomerController::class, 'show'])->name('customers.info');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('plans', function () {
        return Inertia::render('plans');
    })->name('plans');
});


Route::middleware('auth')->get('/user-management', function () {
    $user = Auth::user();
    if ($user->role !== 'superadmin') {
        abort(403, 'Unauthorized');
    }
    return Inertia::render('superadmin/index');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('AccountDeactivated', function () {
        $user = Auth::user();

        if ($user->status !== 'inactive') {
            abort(403, 'Unauthorized: Your account is active.');
        }

        return Inertia::render('superadmin/AccountDeactivated');
    })->name('AccountDeactivated');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('sales', function () {
        return Inertia::render('sales/Index');
    })->name('sales');
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
    Route::get('/customers/{id}/history', [HistoryController::class, 'index']);
    Route::get('/salesResult', [HistoryController::class, 'sales']);
    Route::get('/users', [RegisteredUserController::class, 'index']);
    Route::put('/userUpdate/{user}', [RegisteredUserController::class, 'update']);
});


Route::get('/plans/{planId}/subscribers', [PlanController::class, 'getSubscribers']);

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
