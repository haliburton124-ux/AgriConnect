class Announcement {
  const Announcement({
    required this.id,
    required this.title,
    required this.content,
    this.publishedAt,
    this.coverImagePath,
    this.posterName,
  });

  factory Announcement.fromJson(Map<String, dynamic> json) {
    final poster = json['posted_by'] as Map<String, dynamic>?;
    final first = poster?['first_name'] as String? ?? '';
    final last = poster?['last_name'] as String? ?? '';
    return Announcement(
      id: json['id'] as int,
      title: json['title'] as String? ?? '',
      content: json['content'] as String? ?? '',
      publishedAt: json['published_at'] as String?,
      coverImagePath: json['cover_image_path'] as String?,
      posterName: poster != null ? '$first $last'.trim() : null,
    );
  }

  final int id;
  final String title;
  final String content;
  final String? publishedAt;
  final String? coverImagePath;
  final String? posterName;
}
