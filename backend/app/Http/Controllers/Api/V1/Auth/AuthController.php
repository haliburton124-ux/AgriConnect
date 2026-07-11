<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Http\Resources\UserResource;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Services\AuthService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService,
        protected UserRepositoryInterface $users,
    ) {
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        $payload = [
            'message' => $result['delivered']
                ? 'Registration successful. Please check your email for a one-time verification code.'
                : 'Registration successful. Email delivery is unavailable on this server — use the verification code shown on the next screen.',
            'user' => new UserResource($result['user']),
        ];

        if ($result['verification_code']) {
            $payload['verification_code'] = $result['verification_code'];
        }

        return response()->json($payload, 201);
    }

    public function verifyOtp(VerifyOtpRequest $request): JsonResponse
    {
        $user = $this->users->findByEmail($request->validated('email'));

        $this->authService->verifyOtp($user, $request->validated('otp'));

        $token = $user->createToken('agriri-device')->plainTextToken;

        return response()->json([
            'message' => 'Account verified successfully.',
            'token' => $token,
            'user' => new UserResource($user->fresh()),
        ]);
    }

    public function resendOtp(ForgotPasswordRequest $request): JsonResponse
    {
        $user = $this->users->findByEmail($request->validated('email'));
        $result = $this->authService->issueOtp($user);

        $payload = [
            'message' => $result['delivered']
                ? 'A new verification code has been sent to your email.'
                : 'A new verification code has been generated. Use the code shown on screen.',
        ];

        if ($result['verification_code']) {
            $payload['verification_code'] = $result['verification_code'];
        }

        return response()->json($payload);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->attemptLogin(
            $request->validated('email'),
            $request->validated('password'),
            $request->validated('device_name'),
        );

        return response()->json([
            'message' => 'Login successful.',
            'token' => $result['token'],
            'user' => new UserResource($result['user']->load(['municipality', 'barangay'])),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function logoutAllDevices(Request $request): JsonResponse
    {
        $this->authService->logout($request->user(), everywhere: true);

        return response()->json(['message' => 'Logged out from all devices.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()->load(['municipality', 'barangay', 'technicianProfile'])),
        ]);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink($request->only('email'));

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => 'Password reset link sent to your email.'])
            : response()->json(['message' => 'Unable to send reset link.'], 422);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill(['password' => bcrypt($password)])->setRememberToken(Str::random(60));
                $user->save();
                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => 'Password has been reset successfully.'])
            : response()->json(['message' => 'Unable to reset password. The token may be invalid or expired.'], 422);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $this->authService->changePassword($request->user(), $request->validated('password'));

        return response()->json(['message' => 'Password changed successfully. Please log in again.']);
    }
}
