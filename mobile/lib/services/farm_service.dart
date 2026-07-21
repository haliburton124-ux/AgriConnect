import '../core/api/api_client.dart';
import '../models/farm.dart';

class FarmPayload {
  FarmPayload({
    required this.farmName,
    required this.municipalityId,
    required this.barangayId,
    required this.latitude,
    required this.longitude,
    required this.farmType,
    this.address,
    this.areaHectares,
    this.primaryCrop,
    this.ownershipStatus,
  });

  final String farmName;
  final int municipalityId;
  final int barangayId;
  final double latitude;
  final double longitude;
  final String farmType;
  final String? address;
  final double? areaHectares;
  final String? primaryCrop;
  final String? ownershipStatus;

  Map<String, dynamic> toJson() => {
        'farm_name': farmName,
        'municipality_id': municipalityId,
        'barangay_id': barangayId,
        'latitude': latitude,
        'longitude': longitude,
        'farm_type': farmType,
        if (address != null && address!.isNotEmpty) 'address': address,
        if (areaHectares != null) 'area_hectares': areaHectares,
        if (primaryCrop != null && primaryCrop!.isNotEmpty) 'primary_crop': primaryCrop,
        if (ownershipStatus != null && ownershipStatus!.isNotEmpty) 'ownership_status': ownershipStatus,
      };
}

class FarmService {
  FarmService(this._api);

  final ApiClient _api;

  Future<List<Farm>> list() {
    return _api.handle(
      _api.get('/farmer/farms'),
      (json) {
        final data = (json as Map<String, dynamic>)['data'] as List<dynamic>;
        return data.map((item) => Farm.fromJson(item as Map<String, dynamic>)).toList();
      },
    );
  }

  Future<Farm> get(int id) {
    return _api.handle(
      _api.get('/farmer/farms/$id'),
      (json) => Farm.fromJson((json as Map<String, dynamic>)['data'] as Map<String, dynamic>),
    );
  }

  Future<Farm> create(FarmPayload payload) {
    return _api.handle(
      _api.post('/farmer/farms', data: payload.toJson()),
      (json) => Farm.fromJson((json as Map<String, dynamic>)['data'] as Map<String, dynamic>),
    );
  }

  Future<Farm> update(int id, FarmPayload payload) {
    return _api.handle(
      _api.put('/farmer/farms/$id', data: payload.toJson()),
      (json) => Farm.fromJson((json as Map<String, dynamic>)['data'] as Map<String, dynamic>),
    );
  }

  Future<void> remove(int id) {
    return _api.handle(
      _api.delete('/farmer/farms/$id'),
      (_) {},
    );
  }
}
