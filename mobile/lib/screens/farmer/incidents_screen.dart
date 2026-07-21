import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../core/api/api_exception.dart';
import '../../models/farm.dart';
import '../../models/incident.dart';
import '../../providers/auth_provider.dart';
import '../../services/farm_service.dart';
import '../../services/incident_service.dart';
import '../../widgets/agri_map_view.dart';
import '../../widgets/agri_page_header.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/expandable_text.dart';
import '../../widgets/loading_view.dart';
import 'report_incident_screen.dart';

const _statusTabs = [
  ('', 'All'),
  ('pending', 'Pending'),
  ('validated', 'Validated'),
  ('assigned', 'Assigned'),
  ('ongoing', 'Ongoing'),
  ('resolved', 'Resolved'),
  ('rejected', 'Rejected'),
];

class IncidentsScreen extends StatefulWidget {
  const IncidentsScreen({super.key});

  @override
  State<IncidentsScreen> createState() => _IncidentsScreenState();
}

class _IncidentsScreenState extends State<IncidentsScreen> {
  late IncidentService _incidents;
  late FarmService _farms;

  List<Incident>? _list;
  List<Farm>? _geolocatedFarms;
  String _status = '';
  String _search = '';
  bool _loading = true;
  String? _error;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final api = context.read<AuthProvider>().api;
    _incidents = IncidentService(api);
    _farms = FarmService(api);
    _loadAll();
  }

  Future<void> _loadAll() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final results = await Future.wait([
        _incidents.list(status: _status.isEmpty ? null : _status, search: _search.isEmpty ? null : _search),
        _farms.list(),
      ]);
      if (!mounted) return;
      final farms = results[1] as List<Farm>;
      setState(() {
        _list = results[0] as List<Incident>;
        _geolocatedFarms = farms.where((f) => f.hasValidLocation).toList();
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  bool get _hasFarm => (_geolocatedFarms?.isNotEmpty ?? false);

  Future<void> _openReport() async {
    if (!_hasFarm) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Register at least one farm with GPS before reporting incidents.'),
        ),
      );
      return;
    }
    final saved = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => ReportIncidentScreen(farms: _geolocatedFarms!),
      ),
    );
    if (saved == true) _loadAll();
  }

  void _openDetail(Incident incident) async {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _IncidentDetailSheet(
        incident: incident,
        loadFull: () => _incidents.get(incident.id),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading && _list == null) {
      return const LoadingView(message: 'Loading incidents…');
    }

    return RefreshIndicator(
      color: AgriColors.forest,
      onRefresh: _loadAll,
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          SliverToBoxAdapter(
            child: AgriPageHeader(
              title: 'My Incident Reports',
              subtitle: 'Track every report from pending to resolved.',
              action: IconButton(
                onPressed: _hasFarm ? _openReport : null,
                icon: const Icon(Icons.add_circle_outline, color: AgriColors.forest),
                tooltip: 'Report incident',
              ),
            ),
          ),
          if (!_hasFarm)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AgriColors.gold.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AgriColors.gold.withValues(alpha: 0.25)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Register a farm first', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                      const SizedBox(height: 4),
                      Text(
                        'You need at least one farm with a valid GPS location before reporting incidents.',
                        style: GoogleFonts.poppins(fontSize: 13, color: AgriColors.muted),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          SliverToBoxAdapter(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: Row(
                children: _statusTabs.map((tab) {
                  final selected = _status == tab.$1;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      label: Text(tab.$2),
                      selected: selected,
                      onSelected: (_) {
                        setState(() => _status = tab.$1);
                        _loadAll();
                      },
                      selectedColor: AgriColors.forest.withValues(alpha: 0.15),
                      checkmarkColor: AgriColors.forest,
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          if (_error != null)
            SliverFillRemaining(
              child: Center(child: Text(_error!, style: const TextStyle(color: AgriColors.muted))),
            )
          else if (_list == null || _list!.isEmpty)
            SliverFillRemaining(
              hasScrollBody: false,
              child: EmptyState(
                icon: Icons.warning_amber_outlined,
                title: 'No incidents found',
                description: 'Try a different filter or report a new incident.',
                actionLabel: _hasFarm ? 'Report Incident' : null,
                onAction: _hasFarm ? _openReport : null,
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              sliver: SliverList.separated(
                itemCount: _list!.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final item = _list![index];
                  return _IncidentTile(incident: item, onTap: () => _openDetail(item));
                },
              ),
            ),
        ],
      ),
    );
  }
}

class _IncidentTile extends StatelessWidget {
  const _IncidentTile({required this.incident, required this.onTap});

  final Incident incident;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
            boxShadow: [AgriTheme.cardShadow],
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(incident.title, style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14)),
                    const SizedBox(height: 4),
                    Text(
                      '${incident.referenceCode} · ${incident.incidentDate}',
                      style: GoogleFonts.poppins(fontSize: 12, color: AgriColors.muted),
                    ),
                  ],
                ),
              ),
              _Badge(text: incident.severity),
              const SizedBox(width: 6),
              _Badge(text: incident.status),
            ],
          ),
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge({required this.text});
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AgriColors.forest.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text,
        style: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.w600, color: AgriColors.forest),
      ),
    );
  }
}

class _IncidentDetailSheet extends StatefulWidget {
  const _IncidentDetailSheet({
    required this.incident,
    required this.loadFull,
  });

  final Incident incident;
  final Future<Incident> Function() loadFull;

  @override
  State<_IncidentDetailSheet> createState() => _IncidentDetailSheetState();
}

class _IncidentDetailSheetState extends State<_IncidentDetailSheet> {
  Incident? _incident;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final full = await widget.loadFull();
      if (!mounted) return;
      setState(() {
        _incident = full;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _incident = widget.incident;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final incident = _incident ?? widget.incident;

    return DraggableScrollableSheet(
      initialChildSize: 0.88,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: _loading
              ? const Center(child: CircularProgressIndicator(color: AgriColors.forest))
              : ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
                  children: [
                    Text(incident.referenceCode, style: GoogleFonts.poppins(fontSize: 12, color: AgriColors.muted)),
                    Text(incident.title, style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      children: [
                        _Badge(text: incident.severity),
                        _Badge(text: incident.status),
                        if (incident.category != null) _Badge(text: incident.category!.name),
                      ],
                    ),
                    const SizedBox(height: 16),
                    ExpandableText(text: incident.description, maxLines: 8),
                    if (incident.rejectionReason != null) ...[
                      const SizedBox(height: 16),
                      Text('Rejection reason', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, color: AgriColors.danger)),
                      Text(incident.rejectionReason!, style: GoogleFonts.poppins(fontSize: 13)),
                    ],
                    if (incident.hasValidLocation) ...[
                      const SizedBox(height: 16),
                      AgriMapView(latitude: incident.latitude, longitude: incident.longitude, height: 200),
                    ],
                    if (incident.recommendations.isNotEmpty) ...[
                      const SizedBox(height: 20),
                      Text('Technician recommendations', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                      ...incident.recommendations.map(
                        (r) => Padding(
                          padding: const EdgeInsets.only(top: 12),
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AgriColors.canvas,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (r.technicianName != null)
                                  Text(r.technicianName!, style: GoogleFonts.poppins(fontSize: 12, color: AgriColors.muted)),
                                Text(r.treatmentRecommendation, style: GoogleFonts.poppins(fontSize: 13)),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
        );
      },
    );
  }
}
