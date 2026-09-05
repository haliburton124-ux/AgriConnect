class AppNotification {
  const AppNotification({
    required this.id,
    required this.type,
    required this.message,
    this.postId,
    this.commentId,
    this.parentCommentId,
    this.actorId,
    this.actorName,
    this.postTitle,
    this.readAt,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as String,
      type: json['type'] as String? ?? 'community',
      message: json['message'] as String? ?? '',
      postId: json['post_id'] as int?,
      commentId: json['comment_id'] as int?,
      parentCommentId: json['parent_comment_id'] as int?,
      actorId: json['actor_id'] as int?,
      actorName: json['actor_name'] as String?,
      postTitle: json['post_title'] as String?,
      readAt: json['read_at'] as String?,
      createdAt: json['created_at'] as String? ?? '',
    );
  }

  final String id;
  final String type;
  final String message;
  final int? postId;
  final int? commentId;
  final int? parentCommentId;
  final int? actorId;
  final String? actorName;
  final String? postTitle;
  final String? readAt;
  final String createdAt;

  bool get isUnread => readAt == null;
}

class NotificationListResult {
  const NotificationListResult({
    required this.notifications,
    required this.unreadCount,
  });

  final List<AppNotification> notifications;
  final int unreadCount;
}
