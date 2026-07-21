class Program {
  const Program({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.isActive,
    this.applicationStart,
    this.applicationEnd,
    this.coverImagePath,
  });

  factory Program.fromJson(Map<String, dynamic> json) {
    return Program(
      id: json['id'] as int,
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      category: json['category'] as String? ?? 'other',
      isActive: json['is_active'] as bool? ?? true,
      applicationStart: json['application_start'] as String?,
      applicationEnd: json['application_end'] as String?,
      coverImagePath: json['cover_image_path'] as String?,
    );
  }

  final int id;
  final String title;
  final String description;
  final String category;
  final bool isActive;
  final String? applicationStart;
  final String? applicationEnd;
  final String? coverImagePath;
}

class ProgramApplication {
  const ProgramApplication({
    required this.id,
    required this.status,
    required this.createdAt,
    this.programTitle,
    this.remarks,
  });

  factory ProgramApplication.fromJson(Map<String, dynamic> json) {
    final program = json['program'] as Map<String, dynamic>?;
    return ProgramApplication(
      id: json['id'] as int,
      status: json['status'] as String? ?? 'submitted',
      createdAt: json['created_at'] as String? ?? '',
      programTitle: program?['title'] as String?,
      remarks: json['remarks'] as String?,
    );
  }

  final int id;
  final String status;
  final String createdAt;
  final String? programTitle;
  final String? remarks;
}
