import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/agri_button.dart';
import '../../widgets/brand_logo.dart';
import '../farmer/farmer_shell_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

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

    return Scaffold(
      backgroundColor: AgriColors.canvas,
      body: SafeArea(
        child: Stack(
          children: [
            Positioned(
              right: -80,
              top: MediaQuery.of(context).size.height * 0.15,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AgriColors.forest.withValues(alpha: 0.05),
                ),
              ),
            ),
            Positioned(
              left: -60,
              bottom: MediaQuery.of(context).size.height * 0.2,
              child: Container(
                width: 160,
                height: 160,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AgriColors.sky.withValues(alpha: 0.05),
                ),
              ),
            ),
            SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const BrandLogo(),
                    const SizedBox(height: 32),
                    Text(
                      'Welcome back',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: AgriColors.ink,
                          ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Sign in to continue to AgriConnect.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AgriColors.muted),
                    ),
                    const SizedBox(height: 28),
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      autofillHints: const [AutofillHints.email],
                      decoration: const InputDecoration(
                        labelText: 'Email address',
                        hintText: 'you@example.com',
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) return 'Enter a valid email address';
                        if (!value.contains('@')) return 'Enter a valid email address';
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      autofillHints: const [AutofillHints.password],
                      decoration: InputDecoration(
                        labelText: 'Password',
                        hintText: '••••••••',
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                            size: 20,
                            color: AgriColors.muted,
                          ),
                          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) return 'Password is required';
                        return null;
                      },
                    ),
                    const SizedBox(height: 12),
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Use the web app to reset your password for now.')),
                          );
                        },
                        child: Text(
                          'Forgot password?',
                          style: TextStyle(
                            color: AgriColors.forest,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    AgriButton(
                      label: 'Sign in',
                      icon: Icons.login,
                      loading: auth.isLoading,
                      onPressed: _submit,
                    ),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('New farmer? ', style: TextStyle(color: AgriColors.muted, fontSize: 14)),
                        GestureDetector(
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Register on the AgriConnect website for now.')),
                            );
                          },
                          child: Text(
                            'Create an account',
                            style: TextStyle(
                              color: AgriColors.forest,
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
