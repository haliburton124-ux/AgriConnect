<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\OtpNotification;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(protected UserRepositoryInterface $users)
    {
    }

    public function register(array $data): User
    {
        $user = $this->users->create([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'middle_name' => $data['middle_name'] ?? null,
            'email' => $data['email'],
            'phone' => $data['phone'],
            'password' => $data['password'],
            'role' => User::ROLE_FARMER,
            'municipality_id' => $data['municipality_id'],
            'barangay_id' => $data['barangay_id'],
            'status' => 'pending',
        ]);

        $this->issueOtp($user);

        return $user;
    }

    public function attemptLogin(string $email, string $password, ?string $deviceName = null): array
    {
        $user = $this->users->findByEmail($email);

        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->status === 'suspended') {
            throw ValidationException::withMessages([
                'email' => ['Your account has been suspended. Please contact your Municipal Agriculture Office.'],
            ]);
        }

        if ($user->status === 'pending') {
            throw ValidationException::withMessages([
                'email' => ['Please verify your account with the OTP sent to your email before logging in.'],
            ]);
        }

        $token = $user->createToken($deviceName ?? 'agriri-device')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    public function issueOtp(User $user): string
    {
        $otp = (string) random_int(100000, 999999);

        $user->forceFill([
            'otp_code' => Hash::make($otp),
            'otp_expires_at' => now()->addMinutes(10),
        ])->save();

        try {
            $user->notify(new OtpNotification($otp));
            logger()->info("OTP email sent to {$user->email}");
        } catch (\Throwable $e) {
            report($e);
            logger()->error("OTP email failed for {$user->email}: {$e->getMessage()}");
        }

        if (config('mail.default') === 'log') {
            logger()->info("OTP for {$user->email}: {$otp}");
        }

        return $otp;
    }

    public function verifyOtp(User $user, string $otp): bool
    {
        if (! $user->otp_code || ! $user->otp_expires_at || $user->otp_expires_at->isPast()) {
            throw ValidationException::withMessages(['otp' => ['This code has expired. Please request a new one.']]);
        }

        if (! Hash::check($otp, $user->otp_code)) {
            throw ValidationException::withMessages(['otp' => ['The code you entered is incorrect.']]);
        }

        $user->forceFill([
            'otp_code' => null,
            'otp_expires_at' => null,
            'email_verified_at' => $user->email_verified_at ?? now(),
            'status' => 'active',
        ])->save();

        return true;
    }

    public function logout(User $user, bool $everywhere = false): void
    {
        if ($everywhere) {
            $user->tokens()->delete();

            return;
        }

        $user->currentAccessToken()?->delete();
    }

    public function changePassword(User $user, string $newPassword): void
    {
        $user->forceFill(['password' => $newPassword])->save();
        $user->tokens()->delete();
    }
}
