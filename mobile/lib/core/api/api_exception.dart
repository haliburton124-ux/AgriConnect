class ApiException implements Exception {
  ApiException(this.message, {this.statusCode, this.fieldErrors});

  final String message;
  final int? statusCode;
  final Map<String, List<String>>? fieldErrors;

  @override
  String toString() => message;
}

String parseApiErrorMessage(dynamic data, {String fallback = 'Something went wrong.'}) {
  if (data is! Map) return fallback;

  final errors = data['errors'];
  if (errors is Map) {
    for (final entry in errors.entries) {
      final value = entry.value;
      if (value is List && value.isNotEmpty) {
        return value.first.toString();
      }
    }
  }

  final message = data['message'];
  if (message is String && message.isNotEmpty) return message;

  return fallback;
}
