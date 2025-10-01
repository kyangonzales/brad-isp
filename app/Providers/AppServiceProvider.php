<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth; // ✅ ito ang kulang mo dati

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // ✅ I-share ang auth user sa Inertia
        Inertia::share([
            'auth' => function () {
                return [
                    'user' => Auth::user(), // ← gamitin ang Auth::user() kaysa auth()->user()
                ];
            },
        ]);
    }
}
