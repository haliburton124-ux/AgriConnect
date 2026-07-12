<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

/**
 * Authenticates the request when a valid Sanctum bearer token is present,
 * but allows unauthenticated guests to proceed without a 401.
 */
class OptionalSanctumAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if ($token) {
            $accessToken = PersonalAccessToken::findToken($token);

            if ($accessToken?->tokenable) {
                $request->setUserResolver(fn () => $accessToken->tokenable);
            }
        }

        return $next($request);
    }
}
