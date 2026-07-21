<?php

namespace App\Support;

class PhilippinePhone
{
    public const LOCAL_PATTERN = '/^9\d{9}$/';

    public const E164_PATTERN = '/^\+639\d{9}$/';

    /** @var list<string> */
    public const ALLOWED_SUFFIXES = ['Jr.', 'Sr.', 'II', 'III', 'IV'];

    public static function normalize(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $value) ?? '';

        if (str_starts_with($digits, '63')) {
            $digits = substr($digits, 2);
        } elseif (str_starts_with($digits, '0')) {
            $digits = substr($digits, 1);
        }

        if (preg_match(self::LOCAL_PATTERN, $digits)) {
            return '+63'.$digits;
        }

        return trim($value);
    }

    public static function isValid(?string $value): bool
    {
        $normalized = self::normalize($value);

        return is_string($normalized) && preg_match(self::E164_PATTERN, $normalized) === 1;
    }
}
