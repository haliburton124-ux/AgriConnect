import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../config/theme.dart';

class AdvisoryInfoCards extends StatelessWidget {
  const AdvisoryInfoCards({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _InfoCard(
          icon: Icons.eco,
          iconGradient: true,
          title: 'Public Agricultural Advisories',
          description:
              'Educational posts from every municipality — visible to all registered farmers province-wide. Share knowledge and join the discussion.',
          linkLabel: 'Browse knowledge hub',
          borderColor: AgriColors.forest.withValues(alpha: 0.1),
          backgroundColor: AgriColors.forest.withValues(alpha: 0.04),
        ),
        const SizedBox(height: 12),
        _InfoCard(
          icon: Icons.lock_outline,
          iconColor: AgriColors.gold,
          iconBg: AgriColors.gold.withValues(alpha: 0.15),
          title: 'Municipality-Only Documents',
          description:
              'Memorandums, internal announcements, reports, permits, and confidential LGU files are restricted to authorized users within the posting municipality only.',
          borderColor: AgriColors.gold.withValues(alpha: 0.2),
          backgroundColor: AgriColors.gold.withValues(alpha: 0.04),
          footer: Container(
            margin: const EdgeInsets.only(top: 12),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.8),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AgriColors.gold.withValues(alpha: 0.1)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.shield_outlined, size: 16, color: AgriColors.gold),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'These files never appear in the public feed above.',
                    style: GoogleFonts.poppins(fontSize: 11, color: AgriColors.ink.withValues(alpha: 0.7)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.borderColor,
    required this.backgroundColor,
    this.iconGradient = false,
    this.iconColor,
    this.iconBg,
    this.linkLabel,
    this.footer,
  });

  final IconData icon;
  final String title;
  final String description;
  final Color borderColor;
  final Color backgroundColor;
  final bool iconGradient;
  final Color? iconColor;
  final Color? iconBg;
  final String? linkLabel;
  final Widget? footer;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              gradient: iconGradient ? AgriColors.primaryGradient : null,
              color: iconGradient ? null : iconBg,
              borderRadius: BorderRadius.circular(12),
              boxShadow: iconGradient ? [AgriTheme.cardShadow] : null,
            ),
            child: Icon(icon, color: iconGradient ? Colors.white : iconColor, size: 22),
          ),
          const SizedBox(height: 14),
          Text(title, style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w600, color: AgriColors.ink)),
          const SizedBox(height: 8),
          Text(
            description,
            style: GoogleFonts.poppins(fontSize: 13, color: AgriColors.ink.withValues(alpha: 0.65), height: 1.5),
          ),
          if (linkLabel != null) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.menu_book_outlined, size: 16, color: AgriColors.forest),
                const SizedBox(width: 6),
                Text(
                  '$linkLabel →',
                  style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w600, color: AgriColors.forest),
                ),
              ],
            ),
          ],
          if (footer != null) footer!,
        ],
      ),
    );
  }
}
