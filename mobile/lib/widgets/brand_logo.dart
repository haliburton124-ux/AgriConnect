import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../config/theme.dart';

class BrandLogo extends StatelessWidget {
  const BrandLogo({
    super.key,
    this.compact = false,
    this.light = false,
  });

  final bool compact;
  final bool light;

  @override
  Widget build(BuildContext context) {
    final iconSize = compact ? 36.0 : 40.0;
    final fontSize = compact ? 16.0 : 18.0;
    final textColor = light ? Colors.white : AgriColors.forest;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: iconSize,
          height: iconSize,
          decoration: BoxDecoration(
            gradient: light ? null : AgriColors.primaryGradient,
            color: light ? Colors.white.withValues(alpha: 0.15) : null,
            borderRadius: BorderRadius.circular(compact ? 12 : 14),
            boxShadow: light
                ? null
                : [
                    BoxShadow(
                      color: AgriColors.forest.withValues(alpha: 0.15),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
          ),
          child: Icon(Icons.eco, color: light ? Colors.white : Colors.white, size: compact ? 20 : 22),
        ),
        const SizedBox(width: 10),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'AgriConnect',
              style: GoogleFonts.poppins(
                fontSize: fontSize,
                fontWeight: FontWeight.w600,
                color: textColor,
                height: 1.1,
              ),
            ),
            if (!compact)
              Text(
                'Ilocos Norte',
                style: GoogleFonts.poppins(
                  fontSize: 11,
                  color: light ? Colors.white70 : AgriColors.muted,
                ),
              ),
          ],
        ),
      ],
    );
  }
}
