import 'package:dio/dio.dart';

import '../core/api/api_client.dart';
import '../models/document.dart';

class DocumentService {
  DocumentService(this._api);

  final ApiClient _api;

  Future<List<AppDocument>> list() {
    return _api.handle(
      _api.get('/documents'),
      (json) {
        final data = (json as Map<String, dynamic>)['data'] as List<dynamic>;
        return data.map((e) => AppDocument.fromJson(e as Map<String, dynamic>)).toList();
      },
    );
  }

  Future<String> upload({required String title, required String filePath, String category = 'other'}) async {
    final form = FormData.fromMap({
      'title': title,
      'category': category,
      'file': await MultipartFile.fromFile(filePath),
    });
    return _api.handle(
      _api.postMultipart('/documents', form),
      (json) => (json as Map<String, dynamic>)['message'] as String? ?? 'Document uploaded.',
    );
  }

  Future<void> remove(int id) {
    return _api.handle(
      _api.delete('/documents/$id'),
      (_) {},
    );
  }
}
