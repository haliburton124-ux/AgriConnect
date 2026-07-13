<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\OtpNotification;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(
        protected UserRepositoryInterface $users,
        protected GmailApiService $gmailApi,
    ) {
    }

    public function register(array $data): array
    {
        $existing = $this->users->findByEmail($data['email']);
        $resumed = false;

        $profile = [
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'middle_name' => $data['middle_name'] ?? null,
            'phone' => $data['phone'],
            'password' => $data['password'],
            'municipality_id' => $data['municipality_id'],
            'barangay_id' => $data['barangay_id'],
            'role' => User::ROLE_FARMER,
            'status' => 'pending',
        ];

        if ($existing) {
            if ($existing->hasVerifiedEmail()) {
                throw ValidationException::withMessages([
                    'email' => ['This email is already registered. Please sign in instead.'],
                ]);
            }

            if (! $existing->isPendingVerification()) {
                throw ValidationException::withMessages([
                    'email' => ['This email is already associated with an account. Please contact support.'],
                ]);
            }

            $user = $this->users->update($existing, array_merge($profile, [
                'otp_code' => null,
                'otp_expires_at' => null,
                'email_verified_at' => null,
            ]));
            $resumed = true;
        } else {
            $user = $this->users->create(array_merge($profile, [
                'email' => $data['email'],
            ]));
        }

        $otpDelivery = $this->issueOtp($user);

        return [
            'user' => $user,
            'delivered' => $otpDelivery['delivered'],
            'verification_code' => $otpDelivery['verification_code'],
            'resumed' => $resumed,
        ];
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

    /**
     * @return array{delivered: bool, verification_code: ?string}
     */
    public function issueOtp(User $user): array
    {
        $otp = (string) random_int(100000, 999999);

        $user->forceFill([
            'otp_code' => Hash::make($otp),
            'otp_expires_at' => now()->addMinutes(10),
        ])->save();

        $delivered = $this->deliverOtpEmail($user, $otp);

        return [
            'delivered' => $delivered,
            'verification_code' => $delivered ? null : $otp,
        ];
    }

    protected function deliverOtpEmail(User $user, string $otp): bool
    {
        $subject = 'AgriConnect-IN - Your One-Time Verification Code';
        $html = view('mail.otp', [
            'firstName' => $user->first_name,
            'otp' => $otp,
        ])->render();

        if ($this->gmailApi->isConfigured()) {
            try {
                $this->gmailApi->send($user->email, $subject, $html);
                logger()->info("Gmail API OTP sent to {$user->email}");

                return true;
            } catch (\Throwable $e) {
                report($e);
                logger()->error("Gmail API OTP failed for {$user->email}: {$e->getMessage()}");
            }
        }

        try {
            $user->notify(new OtpNotification($otp));
            logger()->info("SMTP OTP sent to {$user->email}");

            return true;
        } catch (\Throwable $e) {
            report($e);
            logger()->error("SMTP OTP failed for {$user->email}: {$e->getMessage()}");
        }

        logger()->warning("OTP for {$user->email}: {$otp} (email delivery unavailable)");

        return false;
    }

    /**
     * @return array{delivered: bool, reset_url?: string}
     */
    public function sendPasswordResetLink(string $email): array
    {
        $user = $this->users->findByEmail($email);

        if (! $user) {
            return ['delivered' => true];
        }

        $token = Password::broker()->createToken($user);
        $resetUrl = rtrim((string) config('app.frontend_url'), '/').'/reset-password?'.http_build_query([
            'token' => $token,
            'email' => $user->email,
        ]);

        $subject = 'AgriConnect-IN - Reset Your Password';
        $html = view('mail.reset-password', [
            'firstName' => $user->first_name,
            'resetUrl' => $resetUrl,
        ])->render();

        if ($this->gmailApi->isConfigured()) {
            try {
                $this->gmailApi->send($user->email, $subject, $html);
                logger()->info("Gmail API password reset sent to {$user->email}");

                return ['delivered' => true];
            } catch (\Throwable $e) {
                report($e);
                logger()->error("Gmail API password reset failed for {$user->email}: {$e->getMessage()}");
            }
        }

        logger()->warning("Password reset URL for {$user->email}: {$resetUrl} (email delivery unavailable)");

        return [
            'delivered' => false,
            'reset_url' => $resetUrl,
        ];
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
