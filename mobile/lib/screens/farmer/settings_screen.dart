import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../core/api/api_exception.dart';
import '../../providers/auth_provider.dart';
import '../../screens/auth/login_screen.dart';
import '../../services/auth_service.dart';
import '../../widgets/agri_button.dart';
import '../../widgets/agri_page_header.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _changePassword(AuthService auth) async {
    final current = _currentPasswordController.text;
    final password = _newPasswordController.text;
    final confirm = _confirmPasswordController.text;

    if (current.isEmpty) {
      _toast('Enter your current password.');
      return;
    }
    if (password.length < 8) {
      _toast('New password must be at least 8 characters.');
      return;
    }
    if (password != confirm) {
      _toast('Passwords do not match.');
      return;
    }

    setState(() => _submitting = true);
    try {
      await auth.changePassword(
        currentPassword: current,
        password: password,
        passwordConfirmation: confirm,
      );
      if (!mounted) return;
      await context.read<AuthProvider>().logout();
      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (_) => false,
      );
      _toast('Password changed. Please log in again.');
    } on ApiException catch (e) {
      _toast(e.message);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _toast(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final auth = AuthService(context.read<AuthProvider>().api);

    return SingleChildScrollView(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const AgriPageHeader(
            title: 'Settings',
            subtitle: 'Manage your profile and account security.',
          ),
          if (user != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [AgriTheme.cardShadow],
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: AgriColors.forest,
                      child: Text(
                        user.fullName.isNotEmpty ? user.fullName[0].toUpperCase() : 'F',
                        style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.w600, color: Colors.white),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(user.fullName, style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 16)),
                          Text(user.email, style: GoogleFonts.poppins(fontSize: 13, color: AgriColors.muted)),
                          if (user.phone.isNotEmpty)
                            Text(user.phone, style: GoogleFonts.poppins(fontSize: 13, color: AgriColors.muted)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 20),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text('Change password', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 15)),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: [
                _passwordField('Current password', _currentPasswordController),
                const SizedBox(height: 12),
                _passwordField('New password', _newPasswordController),
                const SizedBox(height: 12),
                _passwordField('Confirm new password', _confirmPasswordController),
                const SizedBox(height: 20),
                AgriButton(
                  label: 'Update password',
                  icon: Icons.lock_outline,
                  loading: _submitting,
                  onPressed: _submitting ? null : () => _changePassword(auth),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _passwordField(String label, TextEditingController controller) {
    return TextField(
      controller: controller,
      obscureText: true,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
