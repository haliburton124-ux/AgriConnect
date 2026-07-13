<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a;">
    <p>Hello {{ $firstName }},</p>
    <p>We received a request to reset your AgriConnect password.</p>
    <p>
        <a href="{{ $resetUrl }}" style="display: inline-block; padding: 12px 20px; background: #1f5f3f; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Reset Password
        </a>
    </p>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all;">{{ $resetUrl }}</p>
    <p>This link will expire in 60 minutes.</p>
    <p>If you did not request a password reset, please ignore this email.</p>
</body>
</html>
