import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/agri_button.dart';
import '../../widgets/auth/auth_screen_shell.dart';
import '../../widgets/auth/auth_text_field.dart';
import '../farmer/farmer_shell_screen.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final auth = context.read<AuthProvider>();
    final ok = await auth.login(_emailController.text, _passwordController.text);
    if (!mounted) return;

    if (ok && auth.user?.isFarmer == true) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const FarmerShellScreen()),
      );
      return;
    }

    if (ok && auth.user?.isFarmer != true) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Farmer accounts only on mobile for now.')),
      );
      await auth.logout();
      return;
    }

    if (auth.errorMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(auth.errorMessage!)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return AuthScreenShell(
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const AuthHeader(
              title: 'Welcome back',
              subtitle: 'Sign in to continue to AgriConnect.',
            ),
            const SizedBox(height: 32),
            AuthTextField(
              label: 'Email address',
              controller: _emailController,
              hint: 'you@example.com',
              keyboardType: TextInputType.emailAddress,
              autofillHints: const [AutofillHints.email],
              validator: (value) {
                if (value == null || value.trim().isEmpty) return 'Enter a valid email address';
                if (!value.contains('@')) return 'Enter a valid email address';
                return null;
              },
            ),
            const SizedBox(height: 18),
            AuthPasswordField(
              label: 'Password',
              controller: _passwordController,
              autofillHints: const [AutofillHints.password],
              validator: (value) {
                if (value == null || value.isEmpty) return 'Password is required';
                return null;
              },
            ),
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Use the web app to reset your password for now.')),
                  );
                },
                style: TextButton.styleFrom(
                  foregroundColor: AgriColors.forest,
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
                ),
                child: const Text('Forgot password?', style: TextStyle(fontWeight: FontWeight.w600)),
              ),
            ),
            const SizedBox(height: 12),
            AgriButton(
              label: 'Sign in',
              icon: Icons.login_rounded,
              loading: auth.isLoading,
              onPressed: _submit,
            ),
            const SizedBox(height: 28),
            AuthFooterLink(
              lead: 'New farmer? ',
              action: 'Create an account',
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const RegisterScreen()),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
