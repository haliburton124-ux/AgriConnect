import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../config/api_config.dart';
import '../storage/token_storage.dart';
import 'api_exception.dart';

typedef UnauthorizedCallback = void Function();

class ApiClient {
  ApiClient({TokenStorage? storage, UnauthorizedCallback? onUnauthorized})
      : _storage = storage ?? TokenStorage(),
        _onUnauthorized = onUnauthorized {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.baseUrl,
        connectTimeout: const Duration(seconds: 20),
        receiveTimeout: const Duration(seconds: 20),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.readToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            await _storage.clear();
            _onUnauthorized?.call();
          }
          handler.next(error);
        },
      ),
    );

    if (kDebugMode) {
      _dio.interceptors.add(
        LogInterceptor(requestBody: true, responseBody: true),
      );
    }
  }

  late final Dio _dio;
  final TokenStorage _storage;
  final UnauthorizedCallback? _onUnauthorized;

  Dio get dio => _dio;

  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? queryParameters}) {
    return _dio.get<T>(path, queryParameters: queryParameters);
  }

  Future<Response<T>> post<T>(String path, {dynamic data}) {
    return _dio.post<T>(path, data: data);
  }

  Future<Response<T>> put<T>(String path, {dynamic data}) {
    return _dio.put<T>(path, data: data);
  }

  Future<Response<T>> delete<T>(String path) {
    return _dio.delete<T>(path);
  }

  Future<Response<T>> postMultipart<T>(String path, FormData data) {
    return _dio.post<T>(
      path,
      data: data,
      options: Options(contentType: 'multipart/form-data'),
    );
  }

  Future<T> handle<T>(Future<Response<dynamic>> request, T Function(dynamic json) parser) async {
    try {
      final response = await request;
      return parser(response.data);
    } on DioException catch (error) {
      final status = error.response?.statusCode;
      final data = error.response?.data;
      throw ApiException(
        parseApiErrorMessage(data, fallback: error.message ?? 'Network error.'),
        statusCode: status,
      );
    }
  }
}
