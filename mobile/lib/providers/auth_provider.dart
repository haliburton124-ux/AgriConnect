import 'package:flutter/foundation.dart';

import '../core/api/api_client.dart';
import '../core/api/api_exception.dart';
import '../core/storage/token_storage.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthProvider extends ChangeNotifier {
  AuthProvider({TokenStorage? storage}) : _storage = storage ?? TokenStorage() {
    _api = ApiClient(onUnauthorized: _handleUnauthorized);
    _auth = AuthService(_api);
  }

  final TokenStorage _storage;
  late final ApiClient _api;
  late final AuthService _auth;

  AuthStatus status = AuthStatus.unknown;
  AppUser? user;
  String? errorMessage;
  bool isLoading = false;

  ApiClient get api => _api;
  AuthService get apiAuth => _auth;

  void _handleUnauthorized() {
    user = null;
    status = AuthStatus.unauthenticated;
    notifyListeners();
  }

  Future<void> bootstrap() async {
    isLoading = true;
    notifyListeners();

    try {
      final storedUser = await _storage.readUser();
      final token = await _storage.readToken();

      if (storedUser == null || token == null) {
        status = AuthStatus.unauthenticated;
        return;
      }

      user = AppUser.fromJson(storedUser);
      final freshUser = await _auth.me();
      user = freshUser;
      await _storage.saveSession(token: token, user: freshUser.toJson());
      status = AuthStatus.authenticated;
    } catch (_) {
      await _storage.clear();
      user = null;
      status = AuthStatus.unauthenticated;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    errorMessage = null;
    isLoading = true;
    notifyListeners();

    try {
      final result = await _auth.login(email: email.trim(), password: password);
      await _storage.saveSession(token: result.token, user: result.user.toJson());
      user = result.user;
      status = AuthStatus.authenticated;
      return true;
    } on ApiException catch (error) {
      errorMessage = error.message;
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> verifyOtp(String email, String otp) async {
    errorMessage = null;
    isLoading = true;
    notifyListeners();

    try {
      final result = await _auth.verifyOtp(email: email.trim(), otp: otp);
      await _storage.saveSession(token: result.token, user: result.user.toJson());
      user = result.user;
      status = AuthStatus.authenticated;
      return true;
    } on ApiException catch (error) {
      errorMessage = error.message;
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _auth.logout();
    await _storage.clear();
    user = null;
    status = AuthStatus.unauthenticated;
    notifyListeners();
  }
}
