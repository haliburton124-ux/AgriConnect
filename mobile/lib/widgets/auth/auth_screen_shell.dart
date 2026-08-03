import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../config/theme.dart';

/// Soft auth background with subtle green blobs — matches web login aesthetic.
class AuthScreenShell extends StatelessWidget {
  const AuthScreenShell({
    super.key,
    required this.child,
    this.showBack = false,
    this.onBack,
  });

  final Widget child;
  final bool showBack;
  final VoidCallback? onBack;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AgriColors.canvas,
      body: SafeArea(
        child: Stack(
          children: [
            Positioned(
              right: -70,
              top: MediaQuery.of(context).size.height * 0.08,
              child: _Blob(size: 220, color: AgriColors.forest.withValues(alpha: 0.06)),
            ),
            Positioned(
              left: -50,
              top: MediaQuery.of(context).size.height * 0.42,
              child: _Blob(size: 180, color: AgriColors.forestLight.withValues(alpha: 0.08)),
            ),
            Positioned(
              right: 40,
              bottom: MediaQuery.of(context).size.height * 0.08,
              child: _Blob(size: 120, color: AgriColors.sky.withValues(alpha: 0.05)),
            ),
            if (showBack)
              Positioned(
                top: 8,
                left: 8,
                child: IconButton(
                  onPressed: onBack ?? () => Navigator.of(context).maybePop(),
                  icon: const Icon(Icons.arrow_back_rounded, color: AgriColors.ink),
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.white.withValues(alpha: 0.85),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
            SingleChildScrollView(
              padding: EdgeInsets.fromLTRB(24, showBack ? 56 : 32, 24, 32),
              child: child,
            ),
          ],
        ),
      ),
    );
  }
}

class _Blob extends StatelessWidget {
  const _Blob({required this.size, required this.color});

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(shape: BoxShape.circle, color: color),
    );
  }
}

class AuthHeader extends StatelessWidget {
  const AuthHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.showLogo = true,
  });

  final String title;
  final String? subtitle;
  final bool showLogo;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (showLogo) ...[
          const AuthBrandMark(),
          const SizedBox(height: 28),
        ],
        Text(
          title,
          style: GoogleFonts.poppins(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: AgriColors.ink,
            height: 1.15,
          ),
        ),
        if (subtitle != null) ...[
          const SizedBox(height: 8),
          Text(
            subtitle!,
            style: GoogleFonts.poppins(
              fontSize: 15,
              color: AgriColors.muted,
              height: 1.45,
            ),
          ),
        ],
      ],
    );
  }
}

class AuthBrandMark extends StatelessWidget {
  const AuthBrandMark({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            color: AgriColors.forest.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(14),
          ),
          child: const Icon(Icons.eco_rounded, color: AgriColors.forest, size: 24),
        ),
        const SizedBox(width: 12),
        Text(
          'AgriConnect',
          style: GoogleFonts.poppins(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AgriColors.forest,
            height: 1.1,
          ),
        ),
      ],
    );
  }
}

class AuthStepIndicator extends StatelessWidget {
  const AuthStepIndicator({super.key, required this.step, required this.total});

  final int step;
  final int total;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(total, (index) {
        final current = index + 1;
        final active = current == step;
        final done = current < step;

        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(right: index < total - 1 ? 8 : 0),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              height: 6,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(99),
                gradient: active || done ? AgriColors.primaryGradient : null,
                color: active || done ? null : AgriColors.muted.withValues(alpha: 0.18),
              ),
            ),
          ),
        );
      }),
    );
  }
}

class AuthFooterLink extends StatelessWidget {
  const AuthFooterLink({
    super.key,
    required this.lead,
    required this.action,
    required this.onTap,
  });

  final String lead;
  final String action;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(lead, style: GoogleFonts.poppins(fontSize: 14, color: AgriColors.muted)),
        GestureDetector(
          onTap: onTap,
          child: Text(
            action,
            style: GoogleFonts.poppins(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AgriColors.forest,
            ),
          ),
        ),
      ],
    );
  }
}
