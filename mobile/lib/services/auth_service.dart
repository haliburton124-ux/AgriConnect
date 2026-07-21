import '../core/api/api_client.dart';
import '../models/user.dart';

class AuthService {
  AuthService(this._api);

  final ApiClient _api;

  Future<({String token, AppUser user, String message})> login({
    required String email,
    required String password,
  }) {
    return _api.handle(
      _api.post('/auth/login', data: {
        'email': email,
        'password': password,
        'device_name': 'AgriConnect Mobile',
      }),
      (json) {
        final map = json as Map<String, dynamic>;
        return (
          token: map['token'] as String,
          user: AppUser.fromJson(map['user'] as Map<String, dynamic>),
          message: map['message'] as String? ?? 'Login successful.',
        );
      },
    );
  }

  Future<AppUser> me() {
    return _api.handle(
      _api.get('/auth/me'),
      (json) => AppUser.fromJson((json as Map<String, dynamic>)['user'] as Map<String, dynamic>),
    );
  }

  Future<void> logout() async {
    try {
      await _api.post('/auth/logout');
    } catch (_) {
      // Clear local session even if network fails.
    }
  }

  Future<void> changePassword({
    required String currentPassword,
    required String password,
    required String passwordConfirmation,
  }) {
    return _api.handle(
      _api.post('/auth/change-password', data: {
        'current_password': currentPassword,
        'password': password,
        'password_confirmation': passwordConfirmation,
      }),
      (_) {},
    );
  }

  Future<({String message, String email, String? verificationCode})> register({
    required String firstName,
    required String lastName,
    String? suffix,
    required String email,
    required String phone,
    required String password,
    required String passwordConfirmation,
    required int municipalityId,
    required int barangayId,
  }) {
    return _api.handle(
      _api.post('/auth/register', data: {
        'first_name': firstName,
        'last_name': lastName,
        if (suffix != null && suffix.isNotEmpty) 'suffix': suffix,
        'email': email.trim(),
        'phone': phone,
        'password': password,
        'password_confirmation': passwordConfirmation,
        'municipality_id': municipalityId,
        'barangay_id': barangayId,
      }),
      (json) {
        final map = json as Map<String, dynamic>;
        final user = map['user'] as Map<String, dynamic>;
        return (
          message: map['message'] as String? ?? 'Registration successful.',
          email: user['email'] as String? ?? email.trim(),
          verificationCode: map['verification_code'] as String?,
        );
      },
    );
  }

  Future<({String token, AppUser user, String message})> verifyOtp({
    required String email,
    required String otp,
  }) {
    return _api.handle(
      _api.post('/auth/verify-otp', data: {
        'email': email.trim(),
        'otp': otp,
      }),
      (json) {
        final map = json as Map<String, dynamic>;
        return (
          token: map['token'] as String,
          user: AppUser.fromJson(map['user'] as Map<String, dynamic>),
          message: map['message'] as String? ?? 'Account verified successfully.',
        );
      },
    );
  }

  Future<({String message, String? verificationCode})> resendOtp(String email) {
    return _api.handle(
      _api.post('/auth/resend-otp', data: {'email': email.trim()}),
      (json) {
        final map = json as Map<String, dynamic>;
        return (
          message: map['message'] as String? ?? 'A new verification code has been sent.',
          verificationCode: map['verification_code'] as String?,
        );
      },
    );
  }
}
