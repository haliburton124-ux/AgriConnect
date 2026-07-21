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

  static const String esriWorldImagery =
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  static const String esriReferenceLabels =
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';

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
