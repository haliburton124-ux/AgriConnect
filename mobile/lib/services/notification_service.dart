import '../core/api/api_client.dart';
import '../models/app_notification.dart';

class NotificationService {
  NotificationService(this._api);

  final ApiClient _api;

  Future<NotificationListResult> list({int page = 1}) {
    return _api.handle(
      _api.get('/notifications', queryParameters: {'page': page, 'per_page': 20}),
      (json) {
        final map = json as Map<String, dynamic>;
        final data = map['data'] as List<dynamic>;
        return NotificationListResult(
          notifications: data.map((e) => AppNotification.fromJson(e as Map<String, dynamic>)).toList(),
          unreadCount: map['unread_count'] as int? ?? 0,
        );
      },
    );
  }

  Future<int> unreadCount() {
    return _api.handle(
      _api.get('/notifications/unread-count'),
      (json) => (json as Map<String, dynamic>)['count'] as int? ?? 0,
    );
  }

  Future<AppNotification> markAsRead(String id) {
    return _api.handle(
      _api.post('/notifications/$id/read'),
      (json) => AppNotification.fromJson((json as Map<String, dynamic>)['data'] as Map<String, dynamic>),
    );
  }

  Future<void> markAllAsRead() {
    return _api.handle(
      _api.post('/notifications/read-all'),
      (_) {},
    );
  }
}
