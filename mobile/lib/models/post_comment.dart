class PostComment {
  const PostComment({
    required this.id,
    required this.body,
    required this.authorName,
    required this.createdAt,
  });

  factory PostComment.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    return PostComment(
      id: json['id'] as int,
      body: json['body'] as String? ?? '',
      authorName: user?['full_name'] as String? ?? 'Farmer',
      createdAt: DateTime.tryParse(json['created_at'] as String? ?? '') ?? DateTime.now(),
    );
  }

  final int id;
  final String body;
  final String authorName;
  final DateTime createdAt;
}
