<?php

namespace App\Providers;

use App\Models\Farm;
use App\Models\Incident;
use App\Models\User;
use App\Policies\FarmPolicy;
use App\Policies\IncidentPolicy;
use App\Policies\UserPolicy;
use App\Repositories\Eloquent\UserRepository;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Events\IncidentAssigned;
use App\Events\IncidentStatusChanged;
use App\Listeners\SendIncidentAssignedNotification;
use App\Listeners\SendIncidentStatusNotification;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Repository pattern bindings — swap Eloquent implementations
        // without touching Services or Controllers.
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(
            \App\Repositories\Interfaces\IncidentRepositoryInterface::class,
            \App\Repositories\Eloquent\IncidentRepository::class,
        );
        $this->app->bind(
            \App\Repositories\Interfaces\FarmRepositoryInterface::class,
            \App\Repositories\Eloquent\FarmRepository::class,
        );
        $this->app->bind(
            \App\Repositories\Interfaces\DashboardRepositoryInterface::class,
            \App\Repositories\Eloquent\DashboardRepository::class,
        );
    }

    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(6)->by($request->ip());
        });

        Event::listen(IncidentStatusChanged::class, SendIncidentStatusNotification::class);
        Event::listen(IncidentAssigned::class, SendIncidentAssignedNotification::class);

        Gate::policy(Incident::class, IncidentPolicy::class);
        Gate::policy(Farm::class, FarmPolicy::class);
        Gate::policy(User::class, UserPolicy::class);

        // Audit trail — logs create/update/delete for models where
        // government accountability requires a full change history.
        User::observe(\App\Observers\AuditableObserver::class);
        Incident::observe(\App\Observers\AuditableObserver::class);
        Farm::observe(\App\Observers\AuditableObserver::class);
    }
}
