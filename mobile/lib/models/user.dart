class PlaceRef {
  const PlaceRef({required this.id, required this.name});

  factory PlaceRef.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const PlaceRef(id: 0, name: '');
    return PlaceRef(
      id: json['id'] as int? ?? 0,
      name: json['name'] as String? ?? '',
    );
  }

  final int id;
  final String name;
}

class AppUser {
  const AppUser({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.fullName,
    required this.email,
    required this.phone,
    required this.role,
    required this.status,
    this.municipality,
    this.barangay,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id'] as int,
      firstName: json['first_name'] as String? ?? '',
      lastName: json['last_name'] as String? ?? '',
      fullName: json['full_name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      role: json['role'] as String? ?? 'farmer',
      status: json['status'] as String? ?? 'active',
      municipality: json['municipality'] != null
          ? PlaceRef.fromJson(json['municipality'] as Map<String, dynamic>)
          : null,
      barangay: json['barangay'] != null
          ? PlaceRef.fromJson(json['barangay'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'first_name': firstName,
        'last_name': lastName,
        'full_name': fullName,
        'email': email,
        'phone': phone,
        'role': role,
        'status': status,
        if (municipality != null) 'municipality': {'id': municipality!.id, 'name': municipality!.name},
        if (barangay != null) 'barangay': {'id': barangay!.id, 'name': barangay!.name},
      };

  final int id;
  final String firstName;
  final String lastName;
  final String fullName;
  final String email;
  final String phone;
  final String role;
  final String status;
  final PlaceRef? municipality;
  final PlaceRef? barangay;

  bool get isFarmer => role == 'farmer';
}
