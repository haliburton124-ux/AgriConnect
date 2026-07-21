import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../config/farm_constants.dart';
import '../../config/theme.dart';
import '../../core/api/api_exception.dart';
import '../../models/program.dart';
import '../../providers/auth_provider.dart';
import '../../services/program_service.dart';
import '../../widgets/agri_button.dart';
import '../../widgets/agri_page_header.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/loading_view.dart';

class ProgramsScreen extends StatefulWidget {
  const ProgramsScreen({super.key});

  @override
  State<ProgramsScreen> createState() => _ProgramsScreenState();
}

class _ProgramsScreenState extends State<ProgramsScreen> {
  late ProgramService _programs;
  List<Program>? _list;
  List<ProgramApplication>? _applications;
  bool _loading = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _programs = ProgramService(context.read<AuthProvider>().api);
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final programs = await _programs.list();
    final apps = await _programs.myApplications();
    if (!mounted) return;
    setState(() {
      _list = programs;
      _applications = apps;
      _loading = false;
    });
  }

  Future<void> _apply(Program program) async {
    final remarksController = TextEditingController();
    final docPaths = <String>[];

    final submitted = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (context) => Padding(
        padding: EdgeInsets.fromLTRB(16, 16, 16, MediaQuery.of(context).viewInsets.bottom + 24),
        child: StatefulBuilder(
          builder: (context, setModal) => Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Apply: ${program.title}', style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              TextField(
                controller: remarksController,
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Remarks (optional)', border: OutlineInputBorder()),
              ),
              TextButton.icon(
                onPressed: () async {
                  final result = await FilePicker.platform.pickFiles(allowMultiple: true);
                  if (result != null) {
                    setModal(() => docPaths.addAll(result.paths.whereType<String>()));
                  }
                },
                icon: const Icon(Icons.attach_file),
                label: Text('Documents (${docPaths.length})'),
              ),
              AgriButton(
                label: 'Submit Application',
                onPressed: () async {
                  try {
                    await _programs.apply(
                      program.id,
                      remarks: remarksController.text.trim(),
                      documentPaths: docPaths.isEmpty ? null : docPaths,
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
          ),
        ),
      ),
    );

    if (submitted == true) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Application submitted.')));
      _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const LoadingView(message: 'Loading programs…');

    final programs = _list ?? [];
    final apps = _applications ?? [];

    return RefreshIndicator(
      onRefresh: _load,
      color: AgriColors.forest,
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          const SliverToBoxAdapter(
            child: AgriPageHeader(
              title: 'Government Programs',
              subtitle: 'Browse subsidies, training, loans, and other assistance programs.',
            ),
          ),
          if (apps.isNotEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('My applications', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                    ...apps.map(
                      (a) => ListTile(
                        dense: true,
                        title: Text(a.programTitle ?? 'Program'),
                        trailing: Text(a.status, style: const TextStyle(color: AgriColors.forest, fontSize: 12)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          if (programs.isEmpty)
            const SliverFillRemaining(
              child: EmptyState(
                icon: Icons.card_giftcard_outlined,
                title: 'No programs available',
                description: 'Check back later for new government assistance programs.',
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              sliver: SliverList.separated(
                itemCount: programs.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final p = programs[index];
                  final applied = apps.any((a) => a.programTitle == p.title);
                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [AgriTheme.cardShadow],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(p.title, style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                        const SizedBox(height: 4),
                        Text(formatFarmType(p.category), style: GoogleFonts.poppins(fontSize: 12, color: AgriColors.muted)),
                        const SizedBox(height: 8),
                        Text(p.description, maxLines: 3, overflow: TextOverflow.ellipsis, style: GoogleFonts.poppins(fontSize: 13)),
                        const SizedBox(height: 12),
                        AgriButton(
                          label: applied ? 'Applied' : 'Apply',
                          onPressed: applied || !p.isActive ? null : () => _apply(p),
                          fullWidth: false,
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}
