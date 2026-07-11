<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a;">
    <p>Hello {{ $firstName }},</p>
    <p>Your one-time verification code for AgriConnect is:</p>
    <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">{{ $otp }}</p>
    <p>This code will expire in 10 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
</body>
</html>
