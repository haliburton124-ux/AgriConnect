import 'package:dio/dio.dart';

import '../core/api/api_client.dart';
import '../models/program.dart';

class ProgramService {
  ProgramService(this._api);

  final ApiClient _api;

  Future<List<Program>> list() {
    return _api.handle(
      _api.get('/programs'),
      (json) {
        final data = (json as Map<String, dynamic>)['data'] as List<dynamic>;
        return data.map((e) => Program.fromJson(e as Map<String, dynamic>)).toList();
      },
    );
  }

  Future<List<ProgramApplication>> myApplications() {
    return _api.handle(
      _api.get('/farmer/program-applications'),
      (json) {
        final data = (json as Map<String, dynamic>)['data'] as List<dynamic>;
        return data.map((e) => ProgramApplication.fromJson(e as Map<String, dynamic>)).toList();
      },
    );
  }

  Future<String> apply(int programId, {String? remarks, List<String>? documentPaths}) async {
    final form = FormData.fromMap({
      if (remarks != null && remarks.isNotEmpty) 'remarks': remarks,
    });
    if (documentPaths != null) {
      for (final path in documentPaths) {
        form.files.add(MapEntry('documents[]', await MultipartFile.fromFile(path)));
      }
    }
    return _api.handle(
      _api.postMultipart('/farmer/programs/$programId/apply', form),
      (json) => (json as Map<String, dynamic>)['message'] as String? ?? 'Application submitted.',
    );
  }
}
