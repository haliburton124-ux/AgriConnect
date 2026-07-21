import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../config/theme.dart';
import '../providers/auth_provider.dart';
import '../widgets/brand_logo.dart';
import 'auth/login_screen.dart';
import 'farmer/farmer_shell_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await context.read<AuthProvider>().bootstrap();
      if (!mounted) return;
      _goNext();
    });
  }

  void _goNext() {
    final auth = context.read<AuthProvider>();
    final Widget next;
    if (auth.status == AuthStatus.authenticated && auth.user?.isFarmer == true) {
      next = const FarmerShellScreen();
    } else if (auth.status == AuthStatus.authenticated) {
      next = const _UnsupportedRoleScreen();
    } else {
      next = const LoginScreen();
    }

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => next),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(gradient: AgriColors.primaryGradient),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white24),
              ),
              child: const Icon(Icons.eco, size: 48, color: Colors.white),
            ),
            const SizedBox(height: 24),
            Text(
              'AgriConnect',
              style: GoogleFonts.poppins(fontSize: 28, fontWeight: FontWeight.w700, color: Colors.white),
            ),
            const SizedBox(height: 8),
            Text(
              'Ilocos Norte',
              style: GoogleFonts.poppins(fontSize: 14, color: Colors.white70),
            ),
            const SizedBox(height: 40),
            const CircularProgressIndicator(color: Colors.white),
          ],
        ),
      ),
    );
  }
}

class _UnsupportedRoleScreen extends StatelessWidget {
  const _UnsupportedRoleScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AgriColors.canvas,
      appBar: AppBar(title: const BrandLogo(compact: true)),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.info_outline, size: 48, color: AgriColors.forest.withValues(alpha: 0.8)),
            const SizedBox(height: 16),
            Text(
              'Farmer accounts only',
              style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Text(
              'This mobile app supports farmer accounts. Staff dashboards remain on the web app.',
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(color: AgriColors.muted, height: 1.5),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.read<AuthProvider>().logout(),
              child: const Text('Sign out'),
            ),
          ],
        ),
      ),
    );
  }
}
