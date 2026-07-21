import 'user.dart';

class IncidentCategory {
  const IncidentCategory({
    required this.id,
    required this.name,
    required this.slug,
    required this.color,
  });

  factory IncidentCategory.fromJson(Map<String, dynamic> json) {
    return IncidentCategory(
      id: json['id'] as int,
      name: json['name'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      color: json['color'] as String? ?? '#2E7D32',
    );
  }

  final int id;
  final String name;
  final String slug;
  final String color;
}

class Municipality extends PlaceRef {
  const Municipality({required super.id, required super.name});

  factory Municipality.fromJson(Map<String, dynamic> json) {
    return Municipality(
      id: json['id'] as int? ?? 0,
      name: json['name'] as String? ?? '',
    );
  }
}

class Barangay extends PlaceRef {
  const Barangay({required super.id, required super.name, this.municipalityId});

  factory Barangay.fromJson(Map<String, dynamic> json) {
    return Barangay(
      id: json['id'] as int? ?? 0,
      name: json['name'] as String? ?? '',
      municipalityId: json['municipality_id'] as int?,
    );
  }

  final int? municipalityId;
}
