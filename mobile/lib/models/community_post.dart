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
    this.likedByMe = false,
    this.isSharedInFeed = false,
  });

  factory CommunityPost.fromJson(Map<String, dynamic> json) {
    final municipality = json['municipality'] as Map<String, dynamic>?;
    return CommunityPost(
      id: json['id'] as int,
      title: json['title'] as String? ?? '',
      content: json['content'] as String? ?? '',
      category: json['category'] as String? ?? 'general',
      likesCount: json['likes_count'] as int? ?? 0,
      commentsCount: json['comments_count'] as int? ?? 0,
      sharesCount: json['shares_count'] as int? ?? 0,
      municipalityName: municipality?['name'] as String?,
      likedByMe: json['liked_by_me'] as bool? ?? false,
      isSharedInFeed: json['is_shared_in_feed'] as bool? ?? false,
      createdAt: DateTime.tryParse(json['created_at'] as String? ?? '') ?? DateTime.now(),
    );
  }

  CommunityPost copyWith({
    int? likesCount,
    int? commentsCount,
    int? sharesCount,
    bool? likedByMe,
    bool? isSharedInFeed,
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
      likedByMe: likedByMe ?? this.likedByMe,
      isSharedInFeed: isSharedInFeed ?? this.isSharedInFeed,
    );
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
  final bool likedByMe;
  final bool isSharedInFeed;
}
