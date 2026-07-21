import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../config/theme.dart';
import '../../models/farm.dart';
import '../../widgets/agri_map_view.dart';

class FarmDetailScreen extends StatelessWidget {
  const FarmDetailScreen({super.key, required this.farm});

  final Farm farm;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AgriColors.canvas,
      appBar: AppBar(title: Text(farm.farmName)),
      body: FarmDetailBody(farm: farm),
    );
  }
}

/// Modal sheet — matches web FarmViewModal.
class FarmDetailSheet extends StatelessWidget {
  const FarmDetailSheet({super.key, required this.farm});

  final Farm farm;

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.88,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 20, offset: Offset(0, -4))],
          ),
          child: Column(
            children: [
              const SizedBox(height: 10),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.black12,
                  borderRadius: BorderRadius.circular(99),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 12, 0),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            farm.farmName,
                            style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w700, color: AgriColors.ink),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Farm location on map',
                            style: GoogleFonts.poppins(fontSize: 13, color: AgriColors.muted),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                  child: FarmDetailBody(farm: farm),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class FarmDetailBody extends StatelessWidget {
  const FarmDetailBody({super.key, required this.farm});

  final Farm farm;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          farm.locationLabel,
          style: GoogleFonts.poppins(fontSize: 13, color: AgriColors.muted),
        ),
        const SizedBox(height: 16),
        if (farm.hasValidLocation)
          AgriMapView(latitude: farm.latitude, longitude: farm.longitude, height: 280)
        else
          Container(
            height: 160,
            width: double.infinity,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AgriColors.mutedBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AgriColors.forestLight.withValues(alpha: 0.2)),
            ),
            child: Text(
              'No GPS coordinates for this farm yet.',
              style: GoogleFonts.poppins(color: AgriColors.muted),
            ),
          ),
        const SizedBox(height: 20),
        if (farm.hasValidLocation)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AgriColors.forest.withValues(alpha: 0.04),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AgriColors.forest.withValues(alpha: 0.1)),
            ),
            child: Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 18, color: AgriColors.forest),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '${farm.latitude.toStringAsFixed(5)}, ${farm.longitude.toStringAsFixed(5)}',
                    style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w500, color: AgriColors.ink),
                  ),
                ),
              ],
            ),
          ),
        const SizedBox(height: 16),
        _InfoTile(label: 'Farm type', value: farm.farmType),
        if (farm.primaryCrop != null) _InfoTile(label: 'Primary crop', value: farm.primaryCrop!),
        if (farm.areaHectares != null) _InfoTile(label: 'Area', value: '${farm.areaHectares} hectares'),
      ],
    );
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(label, style: GoogleFonts.poppins(fontSize: 13, color: AgriColors.muted)),
          ),
          Expanded(
            child: Text(
              value,
              style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w600, color: AgriColors.ink),
            ),
          ),
        ],
      ),
    );
  }
}
