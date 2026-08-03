import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../core/api/api_exception.dart';
import '../../providers/auth_provider.dart';
import '../../services/location_service.dart';
import '../../utils/phone_utils.dart';
import '../../widgets/agri_button.dart';
import '../../widgets/auth/auth_screen_shell.dart';
import '../../widgets/auth/auth_text_field.dart';
import '../../widgets/municipality_barangay_fields.dart';
import 'verify_otp_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  late final LocationService _locationService;

  int _step = 1;
  bool _submitting = false;

  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  String? _suffix;
  int? _municipalityId;
  int? _barangayId;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _locationService = LocationService(context.read<AuthProvider>().api);
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _handleBack() {
    if (_step > 1) {
      setState(() => _step--);
    } else {
      Navigator.of(context).pop();
    }
  }

  Future<void> _nextStep() async {
    if (!_validateCurrentStep()) return;
    if (_step < 3) {
      setState(() => _step++);
      return;
    }
    await _submit();
  }

  bool _validateCurrentStep() {
    if (_step == 1) {
      return _formKey.currentState?.validate() ?? false;
    }

    if (_step == 2) {
      if (_municipalityId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Select your municipality.')),
        );
        return false;
      }
      if (_barangayId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Select your barangay.')),
        );
        return false;
      }
      return true;
    }

    if (_step == 3) {
      final passwordError = validatePassword(_passwordController.text);
      if (passwordError != null) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(passwordError)));
        return false;
      }
      if (_passwordController.text != _confirmPasswordController.text) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Passwords do not match.')),
        );
        return false;
      }
      return true;
    }

    return false;
  }

  Future<void> _submit() async {
    setState(() => _submitting = true);

    try {
      final auth = context.read<AuthProvider>();
      final localPhone = normalizePhilippinePhoneInput(_phoneController.text);
      final result = await auth.apiAuth.register(
        firstName: _firstNameController.text.trim(),
        lastName: _lastNameController.text.trim(),
        suffix: _suffix,
        email: _emailController.text.trim(),
        phone: toPhilippineE164(localPhone),
        password: _passwordController.text,
        passwordConfirmation: _confirmPasswordController.text,
        municipalityId: _municipalityId!,
        barangayId: _barangayId!,
      );

      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => VerifyOtpScreen(
            email: result.email,
            verificationCode: result.verificationCode,
          ),
        ),
      );
    } on ApiException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.message)));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  String get _stepTitle {
    switch (_step) {
      case 1:
        return 'Your details';
      case 2:
        return 'Your location';
      default:
        return 'Secure your account';
    }
  }

  String? get _stepSubtitle {
    switch (_step) {
      case 1:
        return 'Tell us a bit about yourself to get started.';
      case 2:
        return 'Select where you farm in Agriri.';
      default:
        return 'Choose a strong password for your account.';
    }
  }

  @override
  Widget build(BuildContext context) {
    return AuthScreenShell(
      showBack: true,
      onBack: _handleBack,
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const AuthBrandMark(),
            const SizedBox(height: 28),
            AuthStepIndicator(step: _step, total: 3),
            const SizedBox(height: 24),
            AuthHeader(
              title: _stepTitle,
              subtitle: _stepSubtitle,
              showLogo: false,
            ),
            const SizedBox(height: 28),
            if (_step == 1) ...[
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: AuthTextField(
                      label: 'First name',
                      controller: _firstNameController,
                      textCapitalization: TextCapitalization.words,
                      validator: (value) =>
                          value == null || value.trim().isEmpty ? 'First name is required' : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: AuthTextField(
                      label: 'Last name',
                      controller: _lastNameController,
                      textCapitalization: TextCapitalization.words,
                      validator: (value) =>
                          value == null || value.trim().isEmpty ? 'Last name is required' : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              AuthDropdownField<String?>(
                label: 'Suffix (optional)',
                value: _suffix,
                items: [
                  const DropdownMenuItem<String?>(value: null, child: Text('None')),
                  ...phSuffixOptions.map(
                    (suffix) => DropdownMenuItem<String?>(value: suffix, child: Text(suffix)),
                  ),
                ],
                onChanged: (value) => setState(() => _suffix = value),
              ),
              const SizedBox(height: 18),
              AuthTextField(
                label: 'Email address',
                controller: _emailController,
                hint: 'you@example.com',
                keyboardType: TextInputType.emailAddress,
                autofillHints: const [AutofillHints.email],
                validator: (value) {
                  if (value == null || value.trim().isEmpty) return 'Email is required';
                  if (!value.contains('@')) return 'Enter a valid email address';
                  return null;
                },
              ),
              const SizedBox(height: 18),
              AuthPhoneField(
                controller: _phoneController,
                validator: validatePhilippineLocalPhone,
                onChanged: (value) {
                  final normalized = normalizePhilippinePhoneInput(value);
                  if (normalized != value) {
                    _phoneController.value = TextEditingValue(
                      text: normalized,
                      selection: TextSelection.collapsed(offset: normalized.length),
                    );
                  }
                },
              ),
              const SizedBox(height: 8),
              Text(
                'Enter 10 digits starting with 9.',
                style: GoogleFonts.poppins(fontSize: 12, color: AgriColors.muted),
              ),
            ],
            if (_step == 2)
              MunicipalityBarangayFields(
                locationService: _locationService,
                municipalityId: _municipalityId,
                barangayId: _barangayId,
                onMunicipalityChanged: (value) => setState(() {
                  _municipalityId = value;
                  _barangayId = null;
                }),
                onBarangayChanged: (value) => setState(() => _barangayId = value),
              ),
            if (_step == 3) ...[
              AuthPasswordField(
                label: 'Password',
                controller: _passwordController,
                autofillHints: const [AutofillHints.newPassword],
              ),
              const SizedBox(height: 18),
              AuthPasswordField(
                label: 'Confirm password',
                controller: _confirmPasswordController,
                autofillHints: const [AutofillHints.newPassword],
              ),
            ],
            const SizedBox(height: 32),
            AgriButton(
              label: _step < 3 ? 'Continue' : 'Create account',
              icon: _step < 3 ? Icons.arrow_forward_rounded : Icons.person_add_outlined,
              loading: _submitting,
              onPressed: _submitting ? null : _nextStep,
            ),
            const SizedBox(height: 20),
            AuthFooterLink(
              lead: 'Already registered? ',
              action: 'Sign in',
              onTap: () => Navigator.of(context).pop(),
            ),
          ],
        ),
      ),
    );
  }
}
