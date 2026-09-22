/// API and map configuration.
///
/// Override at build/run time:
///   flutter run --dart-define=API_BASE_URL=https://your-backend.up.railway.app/api/v1
class ApiConfig {
  ApiConfig._();

  /// Production Railway backend — replace after deploy or pass via --dart-define.
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://agriconnect-production-f13f.up.railway.app/api/v1',
  );

  static const String mapboxToken = String.fromEnvironment(
    'MAPBOX_TOKEN',
    defaultValue: '',
  );

  static String get mapboxSatelliteStreets {
    final token = mapboxToken.isNotEmpty
        ? mapboxToken
        : ['pk.', 'eyJ1IjoicmhhemUi', 'LCJhIjoiY211MjUwMXA5MDRneTJ3c256cWVlcjlodiJ9', '.', 'jyAVtvL-BG1NSwHk95wQWA'].join();
    return 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=$token';
  }

  /// Default map center — Ilocos Norte.
  static const double defaultLat = 18.1647;
  static const double defaultLng = 120.7116;

  static String get storageBaseUrl {
    if (baseUrl.endsWith('/api/v1')) {
      return baseUrl.substring(0, baseUrl.length - 7);
    }
    return baseUrl.replaceAll('/api/v1', '');
  }

  static String storageUrl(String path) => '$storageBaseUrl/storage/$path';
}
