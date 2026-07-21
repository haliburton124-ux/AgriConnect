import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../core/api/api_exception.dart';
import '../../models/appointment.dart';
import '../../providers/auth_provider.dart';
import '../../services/appointment_service.dart';
import '../../services/incident_service.dart';
import '../../widgets/agri_button.dart';
import '../../widgets/agri_page_header.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/loading_view.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> {
  late AppointmentService _appointments;
  late IncidentService _incidents;
  List<Appointment>? _list;
  List<TechnicianOption> _technicians = [];
  bool _loading = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final api = context.read<AuthProvider>().api;
    _appointments = AppointmentService(api);
    _incidents = IncidentService(api);
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final appts = await _appointments.list();
      final incidents = await _incidents.list();
      final techMap = <int, String>{};
      for (final inc in incidents) {
        if (inc.assignedTechnicianId != null && inc.technicianName != null) {
          techMap[inc.assignedTechnicianId!] = inc.technicianName!;
        }
      }
      if (!mounted) return;
      setState(() {
        _list = appts;
        _technicians = techMap.entries.map((e) => TechnicianOption(id: e.key, fullName: e.value)).toList();
        _loading = false;
      });
    } on ApiException catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _schedule() async {
    if (_technicians.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No assigned technician yet. Report an incident and wait for assignment to schedule a visit.')),
      );
      return;
    }

    int? techId = _technicians.length == 1 ? _technicians.first.id : null;
    DateTime scheduled = DateTime.now().add(const Duration(days: 1));
    final purposeController = TextEditingController();

    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return Padding(
          padding: EdgeInsets.fromLTRB(16, 16, 16, MediaQuery.of(context).viewInsets.bottom + 24),
          child: StatefulBuilder(
            builder: (context, setModalState) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text('Schedule visit', style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<int>(
                    decoration: const InputDecoration(labelText: 'Technician', border: OutlineInputBorder()),
                    value: techId,
                    items: _technicians
                        .map((t) => DropdownMenuItem(value: t.id, child: Text(t.fullName)))
                        .toList(),
                    onChanged: (v) => setModalState(() => techId = v),
                  ),
                  const SizedBox(height: 12),
                  ListTile(
                    title: const Text('Date & time'),
                    subtitle: Text(DateFormat.yMMMd().add_jm().format(scheduled)),
                    trailing: const Icon(Icons.calendar_today),
                    onTap: () async {
                      final date = await showDatePicker(
                        context: context,
                        initialDate: scheduled,
                        firstDate: DateTime.now(),
                        lastDate: DateTime.now().add(const Duration(days: 365)),
                      );
                      if (date == null) return;
                      if (!context.mounted) return;
                      final time = await showTimePicker(context: context, initialTime: TimeOfDay.fromDateTime(scheduled));
                      if (time == null) return;
                      setModalState(() {
                        scheduled = DateTime(date.year, date.month, date.day, time.hour, time.minute);
                      });
                    },
                  ),
                  TextField(
                    controller: purposeController,
                    decoration: const InputDecoration(labelText: 'Purpose (optional)', border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 16),
                  AgriButton(
                    label: 'Schedule',
                    onPressed: techId == null
                        ? null
                        : () async {
                            try {
                              await _appointments.create(
                                technicianId: techId!,
                                scheduledAt: scheduled.toUtc().toIso8601String(),
                                purpose: purposeController.text.trim(),
                              );
                              if (context.mounted) Navigator.pop(context, true);
                            } on ApiException catch (e) {
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
                              }
                            }
                          },
                  ),
                ],
              );
            },
          ),
        );
      },
    );

    if (saved == true) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Appointment scheduled.')));
      _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const LoadingView(message: 'Loading appointments…');

    final list = _list ?? [];

    return RefreshIndicator(
      onRefresh: _load,
      color: AgriColors.forest,
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          SliverToBoxAdapter(
            child: AgriPageHeader(
              title: 'Appointments',
              subtitle: 'Schedule and track visits with your assigned technician.',
              action: IconButton(onPressed: _schedule, icon: const Icon(Icons.add, color: AgriColors.forest)),
            ),
          ),
          if (list.isEmpty)
            const SliverFillRemaining(
              hasScrollBody: false,
              child: EmptyState(
                icon: Icons.calendar_month_outlined,
                title: 'No appointments yet',
                description: 'Scheduled visits will appear here.',
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              sliver: SliverList.separated(
                itemCount: list.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final a = list[index];
                  return ListTile(
                    tileColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    title: Text(a.technicianName.isNotEmpty ? a.technicianName : 'Technician visit'),
                    subtitle: Text('${a.scheduledAt}${a.purpose != null ? ' · ${a.purpose}' : ''}'),
                    trailing: Text(a.status, style: GoogleFonts.poppins(fontSize: 11, color: AgriColors.forest)),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}
