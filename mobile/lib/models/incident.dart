import 'location.dart';
import 'user.dart';

class IncidentMedia {
  const IncidentMedia({required this.id, required this.url, required this.type});

  factory IncidentMedia.fromJson(Map<String, dynamic> json) {
    return IncidentMedia(
      id: json['id'] as int,
      url: json['url'] as String? ?? '',
      type: json['type'] as String? ?? 'photo',
    );
  }

  final int id;
  final String url;
  final String type;
}

class IncidentRecommendation {
  const IncidentRecommendation({
    required this.id,
    required this.inspectionNotes,
    required this.treatmentRecommendation,
    this.followUpActions,
    this.technicianName,
    required this.createdAt,
  });

  factory IncidentRecommendation.fromJson(Map<String, dynamic> json) {
    final tech = json['technician'] as Map<String, dynamic>?;
    return IncidentRecommendation(
      id: json['id'] as int,
      inspectionNotes: json['inspection_notes'] as String? ?? '',
      treatmentRecommendation: json['treatment_recommendation'] as String? ?? '',
      followUpActions: json['follow_up_actions'] as String?,
      technicianName: tech?['full_name'] as String?,
      createdAt: DateTime.tryParse(json['created_at'] as String? ?? '') ?? DateTime.now(),
    );
  }

  final int id;
  final String inspectionNotes;
  final String treatmentRecommendation;
  final String? followUpActions;
  final String? technicianName;
  final DateTime createdAt;
}

class Incident {
  const Incident({
    required this.id,
    required this.referenceCode,
    required this.title,
    required this.description,
    required this.severity,
    required this.status,
    required this.latitude,
    required this.longitude,
    required this.incidentDate,
    this.remarks,
    this.rejectionReason,
    this.category,
    this.farmName,
    this.municipality,
    this.barangay,
    this.technicianName,
    this.assignedTechnicianId,
    this.media = const [],
    this.recommendations = const [],
    required this.createdAt,
  });

  factory Incident.fromJson(Map<String, dynamic> json) {
    final category = json['category'] as Map<String, dynamic>?;
    final farm = json['farm'] as Map<String, dynamic>?;
    final tech = json['assigned_technician'] as Map<String, dynamic>?;
    final media = (json['media'] as List<dynamic>?)
            ?.map((e) => IncidentMedia.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
    final recs = (json['recommendations'] as List<dynamic>?)
            ?.map((e) => IncidentRecommendation.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];

    return Incident(
      id: json['id'] as int,
      referenceCode: json['reference_code'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      severity: json['severity'] as String? ?? 'medium',
      status: json['status'] as String? ?? 'pending',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0,
      incidentDate: json['incident_date'] as String? ?? '',
      remarks: json['remarks'] as String?,
      rejectionReason: json['rejection_reason'] as String?,
      category: category != null ? IncidentCategory.fromJson(category) : null,
      farmName: farm?['farm_name'] as String?,
      municipality: json['municipality'] != null
          ? PlaceRef.fromJson(json['municipality'] as Map<String, dynamic>)
          : null,
      barangay: json['barangay'] != null
          ? PlaceRef.fromJson(json['barangay'] as Map<String, dynamic>)
          : null,
      technicianName: tech?['full_name'] as String?,
      assignedTechnicianId: tech?['id'] as int?,
      media: media,
      recommendations: recs,
      createdAt: DateTime.tryParse(json['created_at'] as String? ?? '') ?? DateTime.now(),
    );
  }

  final int id;
  final String referenceCode;
  final String title;
  final String description;
  final String severity;
  final String status;
  final double latitude;
  final double longitude;
  final String incidentDate;
  final String? remarks;
  final String? rejectionReason;
  final IncidentCategory? category;
  final String? farmName;
  final PlaceRef? municipality;
  final PlaceRef? barangay;
  final String? technicianName;
  final int? assignedTechnicianId;
  final List<IncidentMedia> media;
  final List<IncidentRecommendation> recommendations;
  final DateTime createdAt;

  bool get hasValidLocation => latitude != 0 || longitude != 0;
}
