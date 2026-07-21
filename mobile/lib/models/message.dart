class MessageThread {
  const MessageThread({
    required this.partnerId,
    required this.partnerFirstName,
    required this.partnerLastName,
    required this.partnerRole,
    this.lastBody,
    this.unreadCount = 0,
  });

  factory MessageThread.fromJson(Map<String, dynamic> json) {
    final partner = json['partner'] as Map<String, dynamic>;
    final last = json['last_message'] as Map<String, dynamic>?;
    return MessageThread(
      partnerId: partner['id'] as int,
      partnerFirstName: partner['first_name'] as String? ?? '',
      partnerLastName: partner['last_name'] as String? ?? '',
      partnerRole: partner['role'] as String? ?? '',
      lastBody: last?['body'] as String?,
      unreadCount: json['unread_count'] as int? ?? 0,
    );
  }

  final int partnerId;
  final String partnerFirstName;
  final String partnerLastName;
  final String partnerRole;
  final String? lastBody;
  final int unreadCount;

  String get partnerName => '$partnerFirstName $partnerLastName'.trim();
}

class ChatMessage {
  const ChatMessage({
    required this.id,
    required this.senderId,
    required this.body,
    required this.createdAt,
    this.readAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as int,
      senderId: json['sender_id'] as int,
      body: json['body'] as String? ?? '',
      createdAt: DateTime.tryParse(json['created_at'] as String? ?? '') ?? DateTime.now(),
      readAt: json['read_at'] as String?,
    );
  }

  final int id;
  final int senderId;
  final String body;
  final DateTime createdAt;
  final String? readAt;
}
