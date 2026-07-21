import 'package:dio/dio.dart';

import '../core/api/api_client.dart';
import '../models/incident.dart';

class IncidentService {
  IncidentService(this._api);

  final ApiClient _api;

  Future<List<Incident>> list({String? status, String? search}) {
    return _api.handle(
      _api.get('/farmer/incidents', queryParameters: {
        if (status != null && status.isNotEmpty) 'status': status,
        if (search != null && search.isNotEmpty) 'search': search,
      }),
      (json) {
        final data = (json as Map<String, dynamic>)['data'] as List<dynamic>;
        return data.map((e) => Incident.fromJson(e as Map<String, dynamic>)).toList();
      },
    );
  }

  Future<Incident> get(int id) {
    return _api.handle(
      _api.get('/farmer/incidents/$id'),
      (json) => Incident.fromJson((json as Map<String, dynamic>)['data'] as Map<String, dynamic>),
    );
  }

  Future<String> create({
    required int farmId,
    required int categoryId,
    required String title,
    required String description,
    required String severity,
    required double latitude,
    required double longitude,
    required int municipalityId,
    required int barangayId,
    required String incidentDate,
    String? remarks,
    List<String>? photoPaths,
  }) async {
    final form = FormData.fromMap({
      'farm_id': farmId,
      'category_id': categoryId,
      'title': title,
      'description': description,
      'severity': severity,
      'latitude': latitude,
      'longitude': longitude,
      'municipality_id': municipalityId,
      'barangay_id': barangayId,
      'incident_date': incidentDate,
      if (remarks != null && remarks.isNotEmpty) 'remarks': remarks,
    });

    if (photoPaths != null) {
      for (final path in photoPaths) {
        form.files.add(MapEntry('photos[]', await MultipartFile.fromFile(path)));
      }
    }

    return _api.handle(
      _api.postMultipart('/farmer/incidents', form),
      (json) => (json as Map<String, dynamic>)['message'] as String? ?? 'Incident reported successfully.',
    );
  }
}
