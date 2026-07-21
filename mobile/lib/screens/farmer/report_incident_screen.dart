import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../core/api/api_exception.dart';
import '../../models/farm.dart';
import '../../models/location.dart';
import '../../providers/auth_provider.dart';
import '../../services/incident_service.dart';
import '../../services/location_service.dart';
import '../../widgets/agri_button.dart';
import '../../widgets/agri_location_picker.dart';

class ReportIncidentScreen extends StatefulWidget {
  const ReportIncidentScreen({super.key, required this.farms});

  final List<Farm> farms;

  @override
  State<ReportIncidentScreen> createState() => _ReportIncidentScreenState();
}

class _ReportIncidentScreenState extends State<ReportIncidentScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _remarksController = TextEditingController();
  final _picker = ImagePicker();

  late IncidentService _incidents;
  late LocationService _locations;

  Farm? _farm;
  int? _categoryId;
  String _severity = 'medium';
  DateTime _incidentDate = DateTime.now();
  double? _lat;
  double? _lng;
  List<IncidentCategory> _categories = [];
  final List<String> _photoPaths = [];
  bool _loadingMeta = true;
  bool _submitting = false;

  static const _severities = ['low', 'medium', 'high', 'critical'];

  @override
  void initState() {
    super.initState();
    _farm = widget.farms.first;
    if (_farm!.hasValidLocation) {
      _lat = _farm!.latitude;
      _lng = _farm!.longitude;
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final api = context.read<AuthProvider>().api;
    _incidents = IncidentService(api);
    _locations = LocationService(api);
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    try {
      final cats = await _locations.incidentCategories();
      if (!mounted) return;
      setState(() {
        _categories = cats;
        _loadingMeta = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loadingMeta = false);
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _remarksController.dispose();
    super.dispose();
  }

  void _onFarmChanged(Farm? farm) {
    setState(() {
      _farm = farm;
      if (farm != null && farm.hasValidLocation) {
        _lat = farm.latitude;
        _lng = farm.longitude;
      }
    });
  }

  Future<void> _pickPhotos() async {
    final files = await _picker.pickMultiImage(imageQuality: 85);
    if (files.isEmpty) return;
    setState(() {
      for (final f in files) {
        if (_photoPaths.length >= 6) break;
        _photoPaths.add(f.path);
      }
    });
  }

  Future<void> _submit() async {
    final farm = _farm;
    if (farm == null) {
      _toast('Select a farm.');
      return;
    }
    if (_categoryId == null) {
      _toast('Select a category.');
      return;
    }
    final title = _titleController.text.trim();
    if (title.length < 5) {
      _toast('Title must be at least 5 characters.');
      return;
    }
    final description = _descriptionController.text.trim();
    if (description.length < 20) {
      _toast('Description must be at least 20 characters.');
      return;
    }
    if (_lat == null || _lng == null) {
      _toast('Set the incident location on the map.');
      return;
    }
    if (farm.municipality?.id == null || farm.barangay?.id == null) {
      _toast('Selected farm is missing municipality or barangay.');
      return;
    }

    setState(() => _submitting = true);
    try {
      final dateStr =
          '${_incidentDate.year}-${_incidentDate.month.toString().padLeft(2, '0')}-${_incidentDate.day.toString().padLeft(2, '0')}';
      final message = await _incidents.create(
        farmId: farm.id,
        categoryId: _categoryId!,
        title: title,
        description: description,
        severity: _severity,
        latitude: _lat!,
        longitude: _lng!,
        municipalityId: farm.municipality!.id,
        barangayId: farm.barangay!.id,
        incidentDate: dateStr,
        remarks: _remarksController.text.trim().isEmpty ? null : _remarksController.text.trim(),
        photoPaths: _photoPaths.isEmpty ? null : _photoPaths,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
      Navigator.of(context).pop(true);
    } on ApiException catch (e) {
      _toast(e.message);
    } catch (e) {
      _toast(e.toString());
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _toast(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AgriColors.canvas,
      appBar: AppBar(title: const Text('Report Incident')),
      body: _loadingMeta
          ? const Center(child: CircularProgressIndicator(color: AgriColors.forest))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _label('Farm'),
                  DropdownButtonFormField<Farm>(
                    value: _farm,
                    decoration: _inputDecoration(),
                    items: widget.farms
                        .map((f) => DropdownMenuItem(
                              value: f,
                              child: Text('${f.farmName} — ${f.locationLabel}', overflow: TextOverflow.ellipsis),
                            ))
                        .toList(),
                    onChanged: _onFarmChanged,
                  ),
                  const SizedBox(height: 16),
                  _label('Category'),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _categories.map((cat) {
                      final selected = _categoryId == cat.id;
                      return ChoiceChip(
                        label: Text(cat.name, style: const TextStyle(fontSize: 11)),
                        selected: selected,
                        onSelected: (_) => setState(() => _categoryId = cat.id),
                        selectedColor: AgriColors.forest.withValues(alpha: 0.15),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),
                  _field('Title', _titleController, hint: 'e.g. Rice blast affecting 2 hectares'),
                  const SizedBox(height: 12),
                  _field('Description', _descriptionController, maxLines: 4),
                  const SizedBox(height: 16),
                  _label('Severity'),
                  Wrap(
                    spacing: 8,
                    children: _severities.map((s) {
                      return ChoiceChip(
                        label: Text(s),
                        selected: _severity == s,
                        onSelected: (_) => setState(() => _severity = s),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Date observed'),
                    subtitle: Text(
                      '${_incidentDate.year}-${_incidentDate.month.toString().padLeft(2, '0')}-${_incidentDate.day.toString().padLeft(2, '0')}',
                    ),
                    trailing: const Icon(Icons.calendar_today),
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: _incidentDate,
                        firstDate: DateTime(2020),
                        lastDate: DateTime.now(),
                      );
                      if (picked != null) setState(() => _incidentDate = picked);
                    },
                  ),
                  const SizedBox(height: 8),
                  _label('Incident GPS location'),
                  AgriLocationPicker(
                    latitude: _lat,
                    longitude: _lng,
                    onChanged: (lat, lng) => setState(() {
                      _lat = lat;
                      _lng = lng;
                    }),
                  ),
                  const SizedBox(height: 16),
                  OutlinedButton.icon(
                    onPressed: _photoPaths.length >= 6 ? null : _pickPhotos,
                    icon: const Icon(Icons.photo_library_outlined),
                    label: Text('Photos (${_photoPaths.length}/6)'),
                  ),
                  const SizedBox(height: 12),
                  _field('Remarks (optional)', _remarksController),
                  const SizedBox(height: 24),
                  AgriButton(
                    label: 'Submit Report',
                    icon: Icons.send,
                    loading: _submitting,
                    onPressed: _submitting ? null : _submit,
                  ),
                ],
              ),
            ),
    );
  }

  Widget _label(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(text, style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w500)),
    );
  }

  InputDecoration _inputDecoration() {
    return InputDecoration(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
    );
  }

  Widget _field(String label, TextEditingController controller, {int maxLines = 1, String? hint}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _label(label),
        TextField(
          controller: controller,
          maxLines: maxLines,
          decoration: _inputDecoration().copyWith(hintText: hint),
        ),
      ],
    );
  }
}
