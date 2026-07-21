const phSuffixOptions = ['Jr.', 'Sr.', 'II', 'III', 'IV'];

String normalizePhilippinePhoneInput(String value) {
  var digits = value.replaceAll(RegExp(r'\D'), '');

  if (digits.startsWith('63')) {
    digits = digits.substring(2);
  } else if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }

  if (digits.length > 10) {
    digits = digits.substring(0, 10);
  }

  return digits;
}

bool isValidPhilippineLocalPhone(String value) {
  return RegExp(r'^9\d{9}$').hasMatch(value);
}

String toPhilippineE164(String localDigits) => '+63$localDigits';

String? validatePhilippineLocalPhone(String? value) {
  if (value == null || value.trim().isEmpty) {
    return 'Mobile number is required';
  }

  final normalized = normalizePhilippinePhoneInput(value);
  if (!isValidPhilippineLocalPhone(normalized)) {
    return 'Enter a valid Philippine mobile number (9XXXXXXXXX)';
  }

  return null;
}

String? validatePassword(String? value) {
  if (value == null || value.isEmpty) return 'Password is required';
  if (value.length < 8) return 'At least 8 characters';
  if (!RegExp(r'[A-Z]').hasMatch(value)) return 'Include an uppercase letter';
  if (!RegExp(r'[0-9]').hasMatch(value)) return 'Include a number';
  return null;
}
