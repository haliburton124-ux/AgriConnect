import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../config/theme.dart';
import '../../widgets/agri_button.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({
    super.key,
    this.onReportIncident,
    this.onExploreServices,
    this.onOpenKnowledgeHub,
  });

  final VoidCallback? onReportIncident;
  final VoidCallback? onExploreServices;
  final VoidCallback? onOpenKnowledgeHub;

  static const _heroImage =
      'https://agri-connect-smoky.vercel.app/hero-farmers-mobile.jpg';

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Stack(
            children: [
              _HeroSection(onReportIncident: onReportIncident, onExploreServices: onExploreServices),
              Positioned(
                top: MediaQuery.of(context).padding.top + 4,
                left: 4,
                child: Builder(
                  builder: (context) => Material(
                    color: Colors.transparent,
                    child: IconButton(
                      icon: const Icon(Icons.menu, color: Colors.white),
                      onPressed: () => Scaffold.of(context).openDrawer(),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        SliverToBoxAdapter(child: Transform.translate(offset: const Offset(0, -40), child: const _StatsStrip())),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Knowledge Sharing',
                  style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600, color: AgriColors.forest, letterSpacing: 0.5),
                ),
                const SizedBox(height: 6),
                Text(
                  'Learn from municipalities across Ilocos Norte',
                  style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.w700, color: AgriColors.ink, height: 1.2),
                ),
                const SizedBox(height: 8),
                Text(
                  'Public agricultural advisories on pesticide use, crop disease, soil management, planting calendars, and more.',
                  style: GoogleFonts.poppins(fontSize: 14, color: AgriColors.muted, height: 1.5),
                ),
                const SizedBox(height: 20),
                AgriButton(
                  label: 'Browse advisories',
                  icon: Icons.menu_book_outlined,
                  onPressed: onOpenKnowledgeHub ?? () {},
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _HeroSection extends StatelessWidget {
  const _HeroSection({this.onReportIncident, this.onExploreServices});

  final VoidCallback? onReportIncident;
  final VoidCallback? onExploreServices;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.72,
      child: Stack(
        fit: StackFit.expand,
        children: [
          Image.network(
            HomeScreen._heroImage,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(color: AgriColors.forestDark),
          ),
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0x331B5E20), Color(0xCC1B5E20), Color(0xEE1B5E20)],
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.fromLTRB(24, MediaQuery.of(context).padding.top + 16, 24, 48),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(99),
                    border: Border.all(color: Colors.white24),
                  ),
                  child: Text(
                    'PROVINCE OF ILOCOS NORTE',
                    style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white70, letterSpacing: 0.8),
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  'Empowering Farmers Through Modern Agricultural Extension',
                  style: GoogleFonts.poppins(fontSize: 30, fontWeight: FontWeight.w700, color: Colors.white, height: 1.15),
                ),
                ShaderMask(
                  shaderCallback: (bounds) => const LinearGradient(
                    colors: [Color(0xFFA5D6A7), Color(0xFF4FC3F7)],
                  ).createShader(bounds),
                  child: Text(
                    'Agricultural Extension',
                    style: GoogleFonts.poppins(fontSize: 30, fontWeight: FontWeight.w700, color: Colors.white, height: 1.15),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Report farm incidents, receive expert recommendations, monitor your farms, and connect directly with agricultural technicians across Ilocos Norte.',
                  style: GoogleFonts.poppins(fontSize: 15, color: Colors.white.withValues(alpha: 0.85), height: 1.5),
                ),
                const SizedBox(height: 24),
                AgriButton(
                  label: 'Report Incident',
                  icon: Icons.arrow_forward,
                  onPressed: onReportIncident ?? () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Incident reporting coming soon on mobile.')),
                    );
                  },
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: OutlinedButton.icon(
                    onPressed: onExploreServices ?? () {},
                    icon: const Icon(Icons.play_circle_outline, color: Colors.white, size: 18),
                    label: Text('Explore Services', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, color: Colors.white)),
                    style: OutlinedButton.styleFrom(
                      backgroundColor: Colors.white.withValues(alpha: 0.1),
                      side: const BorderSide(color: Colors.white30),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(99)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatsStrip extends StatelessWidget {
  const _StatsStrip();

  static const _stats = [
    (value: '23', label: 'Municipalities Covered'),
    (value: '12,400+', label: 'Farmers Served'),
    (value: '8,900+', label: 'Incidents Resolved'),
    (value: '24h', label: 'Avg. Response Time'),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [AgriTheme.glassShadow],
        border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
      ),
      child: GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        mainAxisSpacing: 20,
        crossAxisSpacing: 12,
        childAspectRatio: 1.6,
        children: _stats.map((stat) {
          return Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ShaderMask(
                shaderCallback: (bounds) => AgriColors.primaryGradient.createShader(bounds),
                child: Text(
                  stat.value,
                  style: GoogleFonts.poppins(fontSize: 28, fontWeight: FontWeight.w700, color: Colors.white),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                stat.label,
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w500, color: AgriColors.ink.withValues(alpha: 0.55)),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }
}
