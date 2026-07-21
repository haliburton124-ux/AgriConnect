import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../config/api_config.dart';
import '../config/theme.dart';

class AgriMapView extends StatelessWidget {
  const AgriMapView({
    super.key,
    required this.latitude,
    required this.longitude,
    this.zoom = 16,
    this.height = 280,
  });

  final double latitude;
  final double longitude;
  final double zoom;
  final double height;

  @override
  Widget build(BuildContext context) {
    final center = LatLng(latitude, longitude);

    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: SizedBox(
        height: height,
        child: FlutterMap(
          options: MapOptions(
            initialCenter: center,
            initialZoom: zoom,
            interactionOptions: const InteractionOptions(
              flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
            ),
          ),
          children: [
            TileLayer(
              urlTemplate: ApiConfig.esriWorldImagery,
              userAgentPackageName: 'com.agriconnect.in.mobile',
            ),
            TileLayer(
              urlTemplate: ApiConfig.esriReferenceLabels,
              userAgentPackageName: 'com.agriconnect.in.mobile',
            ),
            MarkerLayer(
              markers: [
                Marker(
                  point: center,
                  width: 40,
                  height: 40,
                  child: const Icon(Icons.location_on, color: AgriColors.forestLight, size: 36),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
