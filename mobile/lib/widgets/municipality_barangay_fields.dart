import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../config/theme.dart';
import '../models/location.dart';
import '../services/location_service.dart';

class MunicipalityBarangayFields extends StatefulWidget {
  const MunicipalityBarangayFields({
    super.key,
    required this.locationService,
    required this.municipalityId,
    required this.barangayId,
    required this.onMunicipalityChanged,
    required this.onBarangayChanged,
  });

  final LocationService locationService;
  final int? municipalityId;
  final int? barangayId;
  final ValueChanged<int?> onMunicipalityChanged;
  final ValueChanged<int?> onBarangayChanged;

  @override
  State<MunicipalityBarangayFields> createState() => _MunicipalityBarangayFieldsState();
}

class _MunicipalityBarangayFieldsState extends State<MunicipalityBarangayFields> {
  List<Municipality>? _municipalities;
  List<Barangay>? _barangays;
  bool _loadingMuni = true;
  bool _loadingBrgy = false;

  @override
  void initState() {
    super.initState();
    _loadMunicipalities();
    if (widget.municipalityId != null) {
      _loadBarangays(widget.municipalityId!);
    }
  }

  @override
  void didUpdateWidget(MunicipalityBarangayFields oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.municipalityId != oldWidget.municipalityId && widget.municipalityId != null) {
      _loadBarangays(widget.municipalityId!);
    }
  }

  Future<void> _loadMunicipalities() async {
    try {
      final list = await widget.locationService.municipalities();
      if (!mounted) return;
      setState(() {
        _municipalities = list;
        _loadingMuni = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loadingMuni = false);
    }
  }

  Future<void> _loadBarangays(int municipalityId) async {
    setState(() {
      _loadingBrgy = true;
      _barangays = null;
    });
    try {
      final list = await widget.locationService.barangays(municipalityId);
      if (!mounted) return;
      setState(() {
        _barangays = list;
        _loadingBrgy = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loadingBrgy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _DropdownField<int>(
          label: 'Municipality',
          value: widget.municipalityId,
          loading: _loadingMuni,
          items: (_municipalities ?? [])
              .map((m) => DropdownMenuItem(value: m.id, child: Text(m.name)))
              .toList(),
          onChanged: (value) {
            widget.onMunicipalityChanged(value);
            widget.onBarangayChanged(null);
            if (value != null) _loadBarangays(value);
          },
        ),
        const SizedBox(height: 12),
        _DropdownField<int>(
          label: 'Barangay',
          value: widget.barangayId,
          loading: _loadingBrgy,
          enabled: widget.municipalityId != null,
          items: (_barangays ?? [])
              .map((b) => DropdownMenuItem(value: b.id, child: Text(b.name)))
              .toList(),
          onChanged: widget.onBarangayChanged,
        ),
      ],
    );
  }
}

class _DropdownField<T> extends StatelessWidget {
  const _DropdownField({
    required this.label,
    required this.value,
    required this.items,
    required this.onChanged,
    this.loading = false,
    this.enabled = true,
  });

  final String label;
  final T? value;
  final List<DropdownMenuItem<T>> items;
  final ValueChanged<T?> onChanged;
  final bool loading;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w500, color: AgriColors.ink)),
        const SizedBox(height: 6),
        InputDecorator(
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          ),
          child: loading
              ? const SizedBox(height: 24, child: Center(child: CircularProgressIndicator(strokeWidth: 2)))
              : DropdownButtonHideUnderline(
                  child: DropdownButton<T>(
                    isExpanded: true,
                    value: items.any((i) => i.value == value) ? value : null,
                    hint: Text('Select…', style: GoogleFonts.poppins(color: AgriColors.muted)),
                    items: items,
                    onChanged: enabled ? onChanged : null,
                  ),
                ),
        ),
      ],
    );
  }
}
