import 'user.dart';

class Farm {
  const Farm({
    required this.id,
    required this.farmName,
    required this.latitude,
    required this.longitude,
    required this.farmType,
    required this.status,
    this.address,
    this.areaHectares,
    this.primaryCrop,
    this.municipality,
    this.barangay,
  });

  factory Farm.fromJson(Map<String, dynamic> json) {
    return Farm(
      id: json['id'] as int,
      farmName: json['farm_name'] as String? ?? '',
      address: json['address'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0,
      areaHectares: (json['area_hectares'] as num?)?.toDouble(),
      farmType: json['farm_type'] as String? ?? '',
      primaryCrop: json['primary_crop'] as String?,
      status: json['status'] as String? ?? 'active',
      municipality: json['municipality'] != null
          ? PlaceRef.fromJson(json['municipality'] as Map<String, dynamic>)
          : null,
      barangay: json['barangay'] != null
          ? PlaceRef.fromJson(json['barangay'] as Map<String, dynamic>)
          : null,
    );
  }

  final int id;
  final String farmName;
  final String? address;
  final double latitude;
  final double longitude;
  final double? areaHectares;
  final String farmType;
  final String? primaryCrop;
  final String status;
  final PlaceRef? municipality;
  final PlaceRef? barangay;

  bool get hasValidLocation {
    if (latitude == 0 && longitude == 0) return false;
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }

  String get locationLabel {
    final brgy = barangay?.name;
    final muni = municipality?.name;
    if (brgy != null && brgy.isNotEmpty && muni != null && muni.isNotEmpty) {
      return 'Brgy. $brgy, $muni';
    }
    return address ?? 'Location not set';
  }
}
