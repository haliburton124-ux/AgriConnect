class AppDocument {
  const AppDocument({
    required this.id,
    required this.title,
    required this.filePath,
    required this.category,
    required this.createdAt,
    this.mimeType,
    this.sizeBytes,
  });

  factory AppDocument.fromJson(Map<String, dynamic> json) {
    return AppDocument(
      id: json['id'] as int,
      title: json['title'] as String? ?? '',
      filePath: json['file_path'] as String? ?? '',
      category: json['category'] as String? ?? 'other',
      createdAt: json['created_at'] as String? ?? '',
      mimeType: json['mime_type'] as String?,
      sizeBytes: json['size_bytes'] as int?,
    );
  }

  final int id;
  final String title;
  final String filePath;
  final String category;
  final String createdAt;
  final String? mimeType;
  final int? sizeBytes;
}
