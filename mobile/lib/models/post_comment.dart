import '../config/api_config.dart';

class PostComment {
  const PostComment({
    required this.id,
    required this.body,
    required this.authorName,
    required this.createdAt,
    this.parentId,
    this.authorRole,
    this.imageUrl,
    this.imagePath,
    this.replies = const [],
  });

  factory PostComment.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    final repliesRaw = json['replies'] as List<dynamic>?;

    return PostComment(
      id: json['id'] as int,
      body: json['body'] as String? ?? '',
      parentId: json['parent_id'] as int?,
      authorName: user?['full_name'] as String? ?? 'Farmer',
      authorRole: user?['role'] as String?,
      imageUrl: _resolveImageUrl(json),
      imagePath: json['image_path'] as String?,
      createdAt: DateTime.tryParse(json['created_at'] as String? ?? '') ?? DateTime.now(),
      replies: repliesRaw?.map((e) => PostComment.fromJson(e as Map<String, dynamic>)).toList() ?? const [],
    );
  }

  bool get hasBody => body.trim().isNotEmpty;
  bool get hasImage => displayImageUrl != null;

  String? get displayImageUrl {
    if (imageUrl != null && imageUrl!.isNotEmpty) return imageUrl;
    if (imagePath != null && imagePath!.isNotEmpty) return ApiConfig.storageUrl(imagePath!);
    return null;
  }

  final int id;
  final String body;
  final int? parentId;
  final String authorName;
  final String? authorRole;
  final String? imageUrl;
  final String? imagePath;
  final DateTime createdAt;
  final List<PostComment> replies;
}

String? _resolveImageUrl(Map<String, dynamic> json) {
  final url = json['image_url'] as String?;
  if (url != null && url.isNotEmpty) return url;
  final path = json['image_path'] as String?;
  if (path != null && path.isNotEmpty) return ApiConfig.storageUrl(path);
  return null;
}

List<PostComment> collectCommentImages(List<PostComment> comments) {
  final images = <PostComment>[];

  void walk(List<PostComment> items) {
    for (final comment in items) {
      if (comment.hasImage) images.add(comment);
      walk(comment.replies);
    }
  }

  walk(comments);
  return images;
}

int countThreadedComments(List<PostComment> comments) {
  return comments.fold<int>(
    0,
    (total, comment) => total + 1 + countThreadedComments(comment.replies),
  );
}
