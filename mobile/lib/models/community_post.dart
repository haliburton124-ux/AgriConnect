import '../config/api_config.dart';

class PostAuthor {
  const PostAuthor({
    required this.id,
    required this.fullName,
    required this.role,
  });

  factory PostAuthor.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const PostAuthor(id: 0, fullName: '', role: '');
    return PostAuthor(
      id: json['id'] as int? ?? 0,
      fullName: json['full_name'] as String? ?? '',
      role: json['role'] as String? ?? '',
    );
  }

  final int id;
  final String fullName;
  final String role;
}

class CommunityPost {
  const CommunityPost({
    required this.id,
    required this.title,
    required this.content,
    required this.category,
    required this.likesCount,
    required this.commentsCount,
    required this.sharesCount,
    required this.createdAt,
    this.municipalityName,
    this.imagePath,
    this.imagePaths = const [],
    this.imageUrls = const [],
    this.likedByMe = false,
    this.sharedByMe = false,
    this.isSharedInFeed = false,
    this.shareCaption,
    this.shareId,
    this.sharedAt,
    this.sharedBy,
    this.author,
  });

  factory CommunityPost.fromJson(Map<String, dynamic> json) {
    final municipality = json['municipality'] as Map<String, dynamic>?;
    final imagePathsRaw = json['image_paths'] as List<dynamic>?;
    final imageUrlsRaw = json['image_urls'] as List<dynamic>?;

    return CommunityPost(
      id: json['id'] as int,
      title: json['title'] as String? ?? '',
      content: json['content'] as String? ?? '',
      category: json['category'] as String? ?? 'general',
      likesCount: json['likes_count'] as int? ?? 0,
      commentsCount: json['comments_count'] as int? ?? 0,
      sharesCount: json['shares_count'] as int? ?? 0,
      municipalityName: municipality?['name'] as String?,
      imagePath: json['image_path'] as String?,
      imagePaths: imagePathsRaw?.map((e) => e as String).toList() ?? const [],
      imageUrls: imageUrlsRaw?.map((e) => e as String).toList() ?? const [],
      likedByMe: json['liked_by_me'] as bool? ?? false,
      sharedByMe: json['shared_by_me'] as bool? ?? false,
      isSharedInFeed: json['is_shared_in_feed'] as bool? ?? false,
      shareCaption: json['share_caption'] as String?,
      shareId: json['share_id'] as int?,
      sharedAt: json['shared_at'] != null
          ? DateTime.tryParse(json['shared_at'] as String)
          : null,
      sharedBy: json['shared_by'] != null
          ? PostAuthor.fromJson(json['shared_by'] as Map<String, dynamic>)
          : null,
      author: json['author'] != null
          ? PostAuthor.fromJson(json['author'] as Map<String, dynamic>)
          : null,
      createdAt: DateTime.tryParse(json['created_at'] as String? ?? '') ?? DateTime.now(),
    );
  }

  CommunityPost copyWith({
    int? likesCount,
    int? commentsCount,
    int? sharesCount,
    bool? likedByMe,
    bool? sharedByMe,
    bool? isSharedInFeed,
    String? shareCaption,
    int? shareId,
    DateTime? sharedAt,
    PostAuthor? sharedBy,
  }) {
    return CommunityPost(
      id: id,
      title: title,
      content: content,
      category: category,
      likesCount: likesCount ?? this.likesCount,
      commentsCount: commentsCount ?? this.commentsCount,
      sharesCount: sharesCount ?? this.sharesCount,
      createdAt: createdAt,
      municipalityName: municipalityName,
      imagePath: imagePath,
      imagePaths: imagePaths,
      imageUrls: imageUrls,
      likedByMe: likedByMe ?? this.likedByMe,
      sharedByMe: sharedByMe ?? this.sharedByMe,
      isSharedInFeed: isSharedInFeed ?? this.isSharedInFeed,
      shareCaption: shareCaption ?? this.shareCaption,
      shareId: shareId ?? this.shareId,
      sharedAt: sharedAt ?? this.sharedAt,
      sharedBy: sharedBy ?? this.sharedBy,
      author: author,
    );
  }

  bool get hasSharedPostContext =>
      isSharedInFeed && sharedAt != null && sharedBy != null && sharedBy!.id > 0;

  List<String> get displayImageUrls {
    if (imageUrls.isNotEmpty) return imageUrls;
    if (imagePaths.isNotEmpty) {
      return imagePaths.map(ApiConfig.storageUrl).toList();
    }
    if (imagePath != null && imagePath!.isNotEmpty) {
      return [ApiConfig.storageUrl(imagePath!)];
    }
    return const [];
  }

  final int id;
  final String title;
  final String content;
  final String category;
  final int likesCount;
  final int commentsCount;
  final int sharesCount;
  final DateTime createdAt;
  final String? municipalityName;
  final String? imagePath;
  final List<String> imagePaths;
  final List<String> imageUrls;
  final bool likedByMe;
  final bool sharedByMe;
  final bool isSharedInFeed;
  final String? shareCaption;
  final int? shareId;
  final DateTime? sharedAt;
  final PostAuthor? sharedBy;
  final PostAuthor? author;
}
