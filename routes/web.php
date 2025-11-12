<?php

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\UserController;
use App\Http\Controllers\PlanController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\SalesController;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\DashboardController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::get('dashboard', function () {
//         return Inertia::render('dashboard');
//     })->name('dashboard');
// });
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = Auth::user();

        if ($user->status === 'inactive') {
            Auth::logout();
            return redirect()->route('AccountDeactivated');
        }

        return Inertia::render('dashboard');
    })->name('dashboard');
});

// AccountDeactivated accessible to everyone (no auth)
Route::get('AccountDeactivated', function () {
    return Inertia::render('superadmin/AccountDeactivated');
})->name('AccountDeactivated');

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
// Route::middleware(['auth', 'superadmin'])->group(function () {
//     Route::get('/user-management', function () {
//         return Inertia::render('superadmin/index');
//     })->name('user-management');
// });

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
    Route::match(['put', 'post'], '/updateCustomer/{id}', [CustomerController::class, 'update']);
    Route::put('/updateNotes/{id}', [CustomerController::class, 'updateNotes']);
    Route::put('/updateState/{id}', [CustomerController::class, 'updateState']);
    Route::delete('/customers/{id}', [CustomerController::class, 'destroy'])->name('customers.destroy');

    Route::post('/plans', [PlanController::class, 'store']);
    Route::get('/showPlans', [PlanController::class, 'index']);
    Route::delete('/plans/{id}', [PlanController::class, 'destroy']);
    Route::put('/plans/{id}', [PlanController::class, 'update']);

    Route::post('/saveHistory', [HistoryController::class, 'store']);
    Route::get('/customers/{id}/history', [HistoryController::class, 'index']);

    Route::get('/users', [RegisteredUserController::class, 'index']);
    Route::put('/userUpdate/{user}', [RegisteredUserController::class, 'update']);

    //Dashboard data
    Route::get('/dashboard-data', [DashboardController::class, 'getDashboardData']);

    Route::get('/print-receipt', [CustomerController::class, 'printReceipt']);
});

Route::get('/check-cloudinary', function () {
    return config('cloudinary.cloud_url');
});
Route::get('/test-env', function () {
    return file_exists(base_path('.env'))
        ? '✅ ENV file exists'
        : '❌ ENV file NOT FOUND';
});

Route::get('/plans/{planId}/subscribers', [PlanController::class, 'getSubscribers']);

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
