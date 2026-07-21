import '../core/api/api_client.dart';
import '../models/message.dart';

class MessageService {
  MessageService(this._api);

  final ApiClient _api;

  Future<List<MessageThread>> threads() {
    return _api.handle(
      _api.get('/messages/threads'),
      (json) {
        final data = (json as Map<String, dynamic>)['data'] as List<dynamic>;
        return data.map((e) => MessageThread.fromJson(e as Map<String, dynamic>)).toList();
      },
    );
  }

  Future<List<ChatMessage>> conversation(int partnerId) {
    return _api.handle(
      _api.get('/messages/$partnerId'),
      (json) {
        final data = (json as Map<String, dynamic>)['data'] as List<dynamic>;
        return data.map((e) => ChatMessage.fromJson(e as Map<String, dynamic>)).toList();
      },
    );
  }

  Future<ChatMessage> send({required int receiverId, required String body, int? incidentId}) {
    return _api.handle(
      _api.post('/messages', data: {
        'receiver_id': receiverId,
        'body': body,
        if (incidentId != null) 'incident_id': incidentId,
      }),
      (json) => ChatMessage.fromJson((json as Map<String, dynamic>)['data'] as Map<String, dynamic>),
    );
  }
}
