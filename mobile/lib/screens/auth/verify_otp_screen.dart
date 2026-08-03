import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../core/api/api_exception.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/agri_button.dart';
import '../../widgets/auth/auth_screen_shell.dart';
import '../farmer/farmer_shell_screen.dart';

class VerifyOtpScreen extends StatefulWidget {
  const VerifyOtpScreen({
    super.key,
    required this.email,
    this.verificationCode,
  });

  final String email;
  final String? verificationCode;

  @override
  State<VerifyOtpScreen> createState() => _VerifyOtpScreenState();
}

class _VerifyOtpScreenState extends State<VerifyOtpScreen> {
  final _controllers = List.generate(6, (_) => TextEditingController());
  final _focusNodes = List.generate(6, (_) => FocusNode());

  bool _submitting = false;
  bool _resending = false;
  String? _fallbackCode;

  static const _otpRadius = 16.0;

  @override
  void initState() {
    super.initState();
    _fallbackCode = widget.verificationCode;
  }

  @override
  void dispose() {
    for (final controller in _controllers) {
      controller.dispose();
    }
    for (final node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  String get _otp => _controllers.map((controller) => controller.text).join();

  Future<void> _verify() async {
    if (_otp.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter the complete 6-digit code.')),
      );
      return;
    }

    setState(() => _submitting = true);

    try {
      final auth = context.read<AuthProvider>();
      final ok = await auth.verifyOtp(widget.email, _otp);
      if (!mounted) return;

      if (ok) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const FarmerShellScreen()),
          (_) => false,
        );
      } else if (auth.errorMessage != null) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(auth.errorMessage!)));
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _resend() async {
    setState(() => _resending = true);

    try {
      final auth = context.read<AuthProvider>();
      final result = await auth.apiAuth.resendOtp(widget.email);
      if (!mounted) return;

      setState(() => _fallbackCode = result.verificationCode);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            result.verificationCode != null
                ? 'New code generated. Use the code shown below.'
                : result.message,
          ),
        ),
      );
    } on ApiException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.message)));
    } finally {
      if (mounted) setState(() => _resending = false);
    }
  }

  void _onChanged(int index, String value) {
    if (value.length > 1) {
      final digits = value.replaceAll(RegExp(r'\D'), '').split('');
      for (var i = 0; i < 6; i++) {
        _controllers[i].text = i < digits.length ? digits[i] : '';
      }
      _focusNodes[5].requestFocus();
      return;
    }

    if (value.isNotEmpty && index < 5) {
      _focusNodes[index + 1].requestFocus();
    } else if (value.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
    }
  }

  InputDecoration _otpDecoration(bool focused) {
    return InputDecoration(
      counterText: '',
      filled: true,
      fillColor: Colors.white,
      contentPadding: EdgeInsets.zero,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(_otpRadius),
        borderSide: BorderSide(color: AgriColors.ink.withValues(alpha: 0.08)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(_otpRadius),
        borderSide: BorderSide(color: AgriColors.ink.withValues(alpha: 0.08)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(_otpRadius),
        borderSide: BorderSide(color: AgriColors.forest.withValues(alpha: 0.55), width: 1.5),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AuthScreenShell(
      showBack: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const AuthHeader(
            title: 'Verify your email',
            subtitle: null,
            showLogo: true,
          ),
          const SizedBox(height: 12),
          Text(
            _fallbackCode != null
                ? 'Email delivery is unavailable. Use the code below to verify ${widget.email}.'
                : 'Enter the 6-digit code sent to ${widget.email}.',
            style: GoogleFonts.poppins(fontSize: 15, color: AgriColors.muted, height: 1.45),
          ),
          if (_fallbackCode != null) ...[
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AgriColors.forest.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AgriColors.forest.withValues(alpha: 0.15)),
              ),
              child: Column(
                children: [
                  Text(
                    'YOUR VERIFICATION CODE',
                    style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w600, color: AgriColors.forest),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _fallbackCode!.split('').join(' '),
                    style: GoogleFonts.poppins(fontSize: 28, fontWeight: FontWeight.w700, letterSpacing: 6),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(6, (index) {
              return SizedBox(
                width: 48,
                height: 56,
                child: Focus(
                  onFocusChange: (_) => setState(() {}),
                  child: Builder(
                    builder: (context) {
                      final focused = _focusNodes[index].hasFocus;
                      return TextField(
                        controller: _controllers[index],
                        focusNode: _focusNodes[index],
                        textAlign: TextAlign.center,
                        keyboardType: TextInputType.number,
                        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                        maxLength: 1,
                        style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w600, color: AgriColors.ink),
                        decoration: _otpDecoration(focused),
                        onChanged: (value) => _onChanged(index, value),
                      );
                    },
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 32),
          AgriButton(
            label: 'Verify account',
            icon: Icons.verified_user_outlined,
            loading: _submitting,
            onPressed: _submitting ? null : _verify,
          ),
          const SizedBox(height: 16),
          Center(
            child: TextButton(
              onPressed: _resending ? null : _resend,
              style: TextButton.styleFrom(foregroundColor: AgriColors.forest),
              child: Text(
                _resending ? 'Sending…' : 'Didn\'t get a code? Resend code',
                style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
