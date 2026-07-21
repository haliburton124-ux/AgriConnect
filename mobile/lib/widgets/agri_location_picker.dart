import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:latlong2/latlong.dart';

import '../config/api_config.dart';
import '../config/theme.dart';

class AgriLocationPicker extends StatefulWidget {
  const AgriLocationPicker({
    super.key,
    this.latitude,
    this.longitude,
    required this.onChanged,
    this.height = 220,
  });

  final double? latitude;
  final double? longitude;
  final void Function(double lat, double lng) onChanged;
  final double height;

  @override
  State<AgriLocationPicker> createState() => _AgriLocationPickerState();
}

class _AgriLocationPickerState extends State<AgriLocationPicker> {
  late final MapController _mapController;
  LatLng? _point;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
    if (widget.latitude != null && widget.longitude != null) {
      _point = LatLng(widget.latitude!, widget.longitude!);
    }
  }

  @override
  void didUpdateWidget(AgriLocationPicker oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.latitude != oldWidget.latitude || widget.longitude != oldWidget.longitude) {
      if (widget.latitude != null && widget.longitude != null) {
        _point = LatLng(widget.latitude!, widget.longitude!);
      }
    }
  }

  void _setPoint(LatLng point) {
    setState(() => _point = point);
    widget.onChanged(point.latitude, point.longitude);
  }

  Future<void> _useGps() async {
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Location permission is required to use GPS.')),
      );
      return;
    }

    final position = await Geolocator.getCurrentPosition();
    final point = LatLng(position.latitude, position.longitude);
    _mapController.move(point, 16);
    _setPoint(point);
  }

  @override
  Widget build(BuildContext context) {
    final center = _point ?? LatLng(ApiConfig.defaultLat, ApiConfig.defaultLng);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: SizedBox(
            height: widget.height,
            child: Stack(
              children: [
                FlutterMap(
                  mapController: _mapController,
                  options: MapOptions(
                    initialCenter: center,
                    initialZoom: _point != null ? 16 : 10,
                    onTap: (_, point) => _setPoint(point),
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
                    if (_point != null)
                      MarkerLayer(
                        markers: [
                          Marker(
                            point: _point!,
                            width: 44,
                            height: 44,
                            child: const Icon(Icons.location_on, color: AgriColors.forestLight, size: 40),
                          ),
                        ],
                      ),
                  ],
                ),
                Positioned(
                  right: 8,
                  bottom: 8,
                  child: Material(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    elevation: 2,
                    child: IconButton(
                      tooltip: 'Use my location',
                      onPressed: _useGps,
                      icon: const Icon(Icons.my_location, color: AgriColors.forest),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          _point != null
              ? '${_point!.latitude.toStringAsFixed(5)}, ${_point!.longitude.toStringAsFixed(5)}'
              : 'Tap the map or use GPS to set the farm location.',
          style: GoogleFonts.poppins(fontSize: 12, color: AgriColors.muted),
        ),
      ],
    );
  }
}
