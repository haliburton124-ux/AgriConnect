class Appointment {
  const Appointment({
    required this.id,
    required this.scheduledAt,
    required this.status,
    this.purpose,
    this.notes,
    this.technicianFirstName,
    this.technicianLastName,
    this.incidentRef,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) {
    final tech = json['technician'] as Map<String, dynamic>?;
    final incident = json['incident'] as Map<String, dynamic>?;
    return Appointment(
      id: json['id'] as int,
      scheduledAt: json['scheduled_at'] as String? ?? '',
      status: json['status'] as String? ?? 'scheduled',
      purpose: json['purpose'] as String?,
      notes: json['notes'] as String?,
      technicianFirstName: tech?['first_name'] as String?,
      technicianLastName: tech?['last_name'] as String?,
      incidentRef: incident?['reference_code'] as String?,
    );
  }

  final int id;
  final String scheduledAt;
  final String status;
  final String? purpose;
  final String? notes;
  final String? technicianFirstName;
  final String? technicianLastName;
  final String? incidentRef;

  String get technicianName {
    final first = technicianFirstName ?? '';
    final last = technicianLastName ?? '';
    return '$first $last'.trim();
  }
}

class TechnicianOption {
  const TechnicianOption({required this.id, required this.fullName});

  final int id;
  final String fullName;
}
