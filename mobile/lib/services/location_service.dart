import '../core/api/api_client.dart';
import '../models/location.dart';

class LocationService {
  LocationService(this._api);

  final ApiClient _api;

  Future<List<Municipality>> municipalities() {
    return _api.handle(
      _api.get('/locations/municipalities'),
      (json) {
        final data = (json as Map<String, dynamic>)['data'] as List<dynamic>;
        return data.map((e) => Municipality.fromJson(e as Map<String, dynamic>)).toList();
      },
    );
  }

  Future<List<Barangay>> barangays(int municipalityId) {
    return _api.handle(
      _api.get('/locations/barangays', queryParameters: {'municipality_id': municipalityId}),
      (json) {
        final data = (json as Map<String, dynamic>)['data'] as List<dynamic>;
        return data.map((e) => Barangay.fromJson(e as Map<String, dynamic>)).toList();
      },
    );
  }

  Future<List<IncidentCategory>> incidentCategories() {
    return _api.handle(
      _api.get('/locations/incident-categories'),
      (json) {
        final data = (json as Map<String, dynamic>)['data'] as List<dynamic>;
        return data.map((e) => IncidentCategory.fromJson(e as Map<String, dynamic>)).toList();
      },
    );
  }
}
