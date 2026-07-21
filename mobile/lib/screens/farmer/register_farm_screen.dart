import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../config/farm_constants.dart';
import '../../config/theme.dart';
import '../../core/api/api_exception.dart';
import '../../models/farm.dart';
import '../../providers/auth_provider.dart';
import '../../services/farm_service.dart';
import '../../services/location_service.dart';
import '../../widgets/agri_button.dart';
import '../../widgets/agri_location_picker.dart';
import '../../widgets/municipality_barangay_fields.dart';

class RegisterFarmScreen extends StatefulWidget {
  const RegisterFarmScreen({super.key, this.farm});

  final Farm? farm;

  @override
  State<RegisterFarmScreen> createState() => _RegisterFarmScreenState();
}

class _RegisterFarmScreenState extends State<RegisterFarmScreen> {
  final _nameController = TextEditingController();
  final _addressController = TextEditingController();
  final _areaController = TextEditingController();
  final _cropController = TextEditingController();

  late FarmService _farmService;
  late LocationService _locationService;

  int? _municipalityId;
  int? _barangayId;
  double? _lat;
  double? _lng;
  String _farmType = 'rice';
  String? _ownership;
  bool _submitting = false;

  bool get _isEditing => widget.farm != null;

  @override
  void initState() {
    super.initState();
    final farm = widget.farm;
    if (farm != null) {
      _nameController.text = farm.farmName;
      _addressController.text = farm.address ?? '';
      if (farm.areaHectares != null) _areaController.text = farm.areaHectares.toString();
      _cropController.text = farm.primaryCrop ?? '';
      _municipalityId = farm.municipality?.id;
      _barangayId = farm.barangay?.id;
      _farmType = farm.farmType.isNotEmpty ? farm.farmType : 'rice';
      if (farm.hasValidLocation) {
        _lat = farm.latitude;
        _lng = farm.longitude;
      }
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final api = context.read<AuthProvider>().api;
    _farmService = FarmService(api);
    _locationService = LocationService(api);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _addressController.dispose();
    _areaController.dispose();
    _cropController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final name = _nameController.text.trim();
    if (name.length < 2) {
      _showError('Enter a farm name (at least 2 characters).');
      return;
    }
    if (_municipalityId == null || _barangayId == null) {
      _showError('Select municipality and barangay.');
      return;
    }
    if (_lat == null || _lng == null) {
      _showError('Set the farm location on the map before saving.');
      return;
    }

    final areaText = _areaController.text.trim();
    double? area;
    if (areaText.isNotEmpty) {
      area = double.tryParse(areaText);
      if (area == null) {
        _showError('Area must be a valid number.');
        return;
      }
    }

    setState(() => _submitting = true);
    try {
      final payload = FarmPayload(
        farmName: name,
        municipalityId: _municipalityId!,
        barangayId: _barangayId!,
        latitude: _lat!,
        longitude: _lng!,
        farmType: _farmType,
        address: _addressController.text.trim().isEmpty ? null : _addressController.text.trim(),
        areaHectares: area,
        primaryCrop: _cropController.text.trim().isEmpty ? null : _cropController.text.trim(),
        ownershipStatus: _ownership,
      );

      if (_isEditing) {
        await _farmService.update(widget.farm!.id, payload);
      } else {
        await _farmService.create(payload);
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_isEditing ? 'Farm updated successfully.' : 'Farm registered successfully.')),
      );
      Navigator.of(context).pop(true);
    } on ApiException catch (e) {
      _showError(e.message);
    } catch (e) {
      _showError(e.toString());
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AgriColors.canvas,
      appBar: AppBar(
        title: Text(_isEditing ? 'Edit Farm' : 'Register Farm'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Farm details help technicians locate and assist you faster.',
              style: GoogleFonts.poppins(fontSize: 13, color: AgriColors.muted, height: 1.4),
            ),
            const SizedBox(height: 20),
            _textField('Farm name', _nameController),
            const SizedBox(height: 16),
            MunicipalityBarangayFields(
              locationService: _locationService,
              municipalityId: _municipalityId,
              barangayId: _barangayId,
              onMunicipalityChanged: (v) => setState(() => _municipalityId = v),
              onBarangayChanged: (v) => setState(() => _barangayId = v),
            ),
            const SizedBox(height: 16),
            _textField('Address (optional)', _addressController),
            const SizedBox(height: 16),
            Text('Farm location (GPS)', style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w500)),
            const SizedBox(height: 8),
            AgriLocationPicker(
              latitude: _lat,
              longitude: _lng,
              onChanged: (lat, lng) => setState(() {
                _lat = lat;
                _lng = lng;
              }),
            ),
            const SizedBox(height: 16),
            _labeledDropdown(
              label: 'Farm type',
              value: _farmType,
              items: farmTypes,
              onChanged: (v) => setState(() => _farmType = v ?? 'rice'),
            ),
            const SizedBox(height: 12),
            _textField('Area (hectares, optional)', _areaController, keyboardType: TextInputType.number),
            const SizedBox(height: 12),
            _textField('Primary crop (optional)', _cropController),
            const SizedBox(height: 12),
            _labeledDropdown(
              label: 'Ownership (optional)',
              value: _ownership ?? '',
              items: ['', ...ownershipStatuses],
              onChanged: (v) => setState(() => _ownership = v == null || v.isEmpty ? null : v),
              formatLabel: (v) => v.isEmpty ? 'Select…' : formatFarmType(v),
            ),
            const SizedBox(height: 28),
            AgriButton(
              label: _isEditing ? 'Save Changes' : 'Register Farm',
              icon: Icons.check,
              loading: _submitting,
              onPressed: _submitting ? null : _submit,
            ),
          ],
        ),
      ),
    );
  }

  Widget _textField(String label, TextEditingController controller, {TextInputType? keyboardType}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w500)),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      ],
    );
  }

  Widget _labeledDropdown({
    required String label,
    required String value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
    String Function(String)? formatLabel,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w500)),
        const SizedBox(height: 6),
        InputDecorator(
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              isExpanded: true,
              value: items.contains(value) ? value : items.first,
              items: items
                  .map((v) => DropdownMenuItem(
                        value: v,
                        child: Text(formatLabel != null ? formatLabel(v) : formatFarmType(v)),
                      ))
                  .toList(),
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }
}
