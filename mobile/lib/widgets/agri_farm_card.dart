import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../config/theme.dart';
import '../models/farm.dart';

class AgriFarmCard extends StatelessWidget {
  const AgriFarmCard({
    super.key,
    required this.farm,
    required this.onTap,
    this.onEdit,
    this.onDelete,
  });

  final Farm farm;
  final VoidCallback onTap;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  @override
  Widget build(BuildContext context) {
    final cropLine = farm.primaryCrop != null && farm.primaryCrop!.isNotEmpty
        ? '${farm.farmType} · ${farm.primaryCrop}'
        : farm.farmType;

    return Material(
      color: AgriColors.card,
      borderRadius: BorderRadius.circular(16),
      elevation: 0,
      shadowColor: AgriColors.forest.withValues(alpha: 0.1),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.black.withValues(alpha: 0.03)),
            boxShadow: [AgriTheme.cardShadow],
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      gradient: AgriColors.primaryGradient,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.eco, color: Colors.white, size: 22),
                  ),
                  const Spacer(),
                  if (onEdit != null)
                    IconButton(
                      icon: const Icon(Icons.edit_outlined, size: 20),
                      onPressed: () {
                        onEdit!();
                      },
                      tooltip: 'Edit',
                    ),
                  if (onDelete != null)
                    IconButton(
                      icon: const Icon(Icons.delete_outline, size: 20, color: AgriColors.danger),
                      onPressed: () {
                        onDelete!();
                      },
                      tooltip: 'Remove',
                    ),
                  Icon(Icons.chevron_right, color: AgriColors.muted.withValues(alpha: 0.6)),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                farm.farmName,
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AgriColors.ink,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                cropLine,
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  color: AgriColors.muted,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.location_on_outlined, size: 14, color: AgriColors.forest),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      farm.locationLabel,
                      style: GoogleFonts.poppins(fontSize: 12, color: AgriColors.ink.withValues(alpha: 0.7)),
                    ),
                  ),
                ],
              ),
              if (farm.areaHectares != null) ...[
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.straighten, size: 14, color: AgriColors.forest),
                    const SizedBox(width: 6),
                    Text(
                      '${farm.areaHectares} hectares',
                      style: GoogleFonts.poppins(fontSize: 12, color: AgriColors.ink.withValues(alpha: 0.7)),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
