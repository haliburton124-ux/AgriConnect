import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../models/announcement.dart';
import '../../providers/auth_provider.dart';
import '../../services/announcement_service.dart';
import '../../widgets/agri_page_header.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/expandable_text.dart';
import '../../widgets/loading_view.dart';

class AnnouncementsScreen extends StatefulWidget {
  const AnnouncementsScreen({super.key});

  @override
  State<AnnouncementsScreen> createState() => _AnnouncementsScreenState();
}

class _AnnouncementsScreenState extends State<AnnouncementsScreen> {
  late AnnouncementService _announcements;
  List<Announcement>? _list;
  bool _loading = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _announcements = AnnouncementService(context.read<AuthProvider>().api);
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final list = await _announcements.list();
    if (!mounted) return;
    setState(() {
      _list = list;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const LoadingView(message: 'Loading announcements…');

    final list = _list ?? [];

    return RefreshIndicator(
      onRefresh: _load,
      color: AgriColors.forest,
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          const SliverToBoxAdapter(
            child: AgriPageHeader(
              title: 'Announcements',
              subtitle: 'Province-wide updates from agricultural offices.',
            ),
          ),
          if (list.isEmpty)
            const SliverFillRemaining(
              child: EmptyState(
                icon: Icons.campaign_outlined,
                title: 'No announcements',
                description: 'Official announcements will appear here.',
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              sliver: SliverList.separated(
                itemCount: list.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final a = list[index];
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
                        Text(a.title, style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 16)),
                        if (a.publishedAt != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Text(a.publishedAt!, style: GoogleFonts.poppins(fontSize: 11, color: AgriColors.muted)),
                          ),
                        const SizedBox(height: 8),
                        ExpandableText(text: a.content, maxLines: 4),
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
