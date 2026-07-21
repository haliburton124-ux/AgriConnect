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
}
