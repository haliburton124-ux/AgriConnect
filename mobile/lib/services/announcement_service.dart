import '../core/api/api_client.dart';
import '../models/announcement.dart';

class AnnouncementService {
  AnnouncementService(this._api);

  final ApiClient _api;

  Future<List<Announcement>> list() {
    return _api.handle(
      _api.get('/announcements'),
      (json) {
        final data = (json as Map<String, dynamic>)['data'] as List<dynamic>;
        return data.map((e) => Announcement.fromJson(e as Map<String, dynamic>)).toList();
      },
    );
  }
}
