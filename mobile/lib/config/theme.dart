import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// AgriConnect brand tokens — mirrors frontend/tailwind.config.ts
class AgriColors {
  AgriColors._();

  static const forest = Color(0xFF2E7D32);
  static const forestDark = Color(0xFF1B5E20);
  static const forestLight = Color(0xFF66BB6A);
  static const gold = Color(0xFFF9A825);
  static const sky = Color(0xFF0288D1);
  static const canvas = Color(0xFFF8FAF5);
  static const ink = Color(0xFF263238);
  static const muted = Color(0xFF607D8B);
  static const danger = Color(0xFFD32F2F);
  static const card = Colors.white;
  static const mutedBg = Color(0xFFF1F5EF);

  static const primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [forest, forestLight],
  );
}

class AgriTheme {
  AgriTheme._();

  static ThemeData light() {
    final base = ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: AgriColors.canvas,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AgriColors.forest,
        primary: AgriColors.forest,
        secondary: AgriColors.forestLight,
        surface: AgriColors.card,
        error: AgriColors.danger,
      ),
    );

    final textTheme = GoogleFonts.poppinsTextTheme(base.textTheme).apply(
      bodyColor: AgriColors.ink,
      displayColor: AgriColors.ink,
    );

    return base.copyWith(
      textTheme: textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.white.withValues(alpha: 0.92),
        foregroundColor: AgriColors.ink,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.poppins(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: AgriColors.ink,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        labelStyle: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w500, color: AgriColors.ink),
        hintStyle: GoogleFonts.poppins(fontSize: 14, color: AgriColors.muted),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE0E6DE), width: 2)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE0E6DE), width: 2)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AgriColors.forestLight, width: 2)),
        errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AgriColors.danger, width: 2)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: AgriColors.forest,
          foregroundColor: Colors.white,
          minimumSize: const Size.fromHeight(44),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w600),
        ),
      ),
      cardTheme: CardThemeData(
        color: AgriColors.card,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Colors.black.withValues(alpha: 0.03)),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.white,
        indicatorColor: AgriColors.forest.withValues(alpha: 0.1),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          return GoogleFonts.poppins(
            fontSize: 12,
            fontWeight: states.contains(WidgetState.selected) ? FontWeight.w600 : FontWeight.w500,
            color: states.contains(WidgetState.selected) ? AgriColors.forest : AgriColors.muted,
          );
        }),
      ),
      drawerTheme: const DrawerThemeData(backgroundColor: Colors.white),
      dividerColor: Colors.black.withValues(alpha: 0.05),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  static BoxShadow get cardShadow => BoxShadow(
        color: AgriColors.forest.withValues(alpha: 0.10),
        blurRadius: 12,
        offset: const Offset(0, 2),
      );

  static BoxShadow get glassShadow => BoxShadow(
        color: AgriColors.forest.withValues(alpha: 0.12),
        blurRadius: 32,
        offset: const Offset(0, 8),
      );
}
