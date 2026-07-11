<?php

namespace App\Providers;

use App\Models\Farm;
use App\Models\Incident;
use App\Models\User;
use App\Policies\FarmPolicy;
use App\Policies\IncidentPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        User::class => UserPolicy::class,
        Incident::class => IncidentPolicy::class,
        Farm::class => FarmPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
