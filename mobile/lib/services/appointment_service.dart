import '../core/api/api_client.dart';
import '../models/appointment.dart';

class AppointmentService {
  AppointmentService(this._api);

  final ApiClient _api;

  Future<List<Appointment>> list({String? status}) {
    return _api.handle(
      _api.get('/appointments', queryParameters: {
        if (status != null && status.isNotEmpty) 'status': status,
      }),
      (json) {
        final data = (json as Map<String, dynamic>)['data'] as List<dynamic>;
        return data.map((e) => Appointment.fromJson(e as Map<String, dynamic>)).toList();
      },
    );
  }

  Future<Appointment> create({
    required int technicianId,
    required String scheduledAt,
    String? purpose,
    String? notes,
    int? incidentId,
    int? farmId,
  }) {
    return _api.handle(
      _api.post('/appointments', data: {
        'technician_id': technicianId,
        'scheduled_at': scheduledAt,
        if (purpose != null && purpose.isNotEmpty) 'purpose': purpose,
        if (notes != null && notes.isNotEmpty) 'notes': notes,
        if (incidentId != null) 'incident_id': incidentId,
        if (farmId != null) 'farm_id': farmId,
      }),
      (json) => Appointment.fromJson((json as Map<String, dynamic>)['data'] as Map<String, dynamic>),
    );
  }

  Future<void> updateStatus(int id, String status) {
    return _api.handle(
      _api.put('/appointments/$id/status', data: {'status': status}),
      (_) {},
    );
  }
}
