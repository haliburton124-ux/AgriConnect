<?php

use Laravel\Sanctum\Sanctum;

return [

    'stateful' => explode(',', env(
        'SANCTUM_STATEFUL_DOMAINS',
        'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1'
    )),

    'guard' => ['web'],

    // Personal access tokens for the mobile app (Flutter) never expire by
    // default; web SPA tokens expire after 8 hours of inactivity.
    'expiration' => env('SANCTUM_TOKEN_EXPIRATION', null),

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', 'agriri_'),

    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],

];
