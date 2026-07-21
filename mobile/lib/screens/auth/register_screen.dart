import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../core/api/api_exception.dart';
import '../../providers/auth_provider.dart';
import '../../services/location_service.dart';
import '../../utils/phone_utils.dart';
import '../../widgets/agri_button.dart';
import '../../widgets/brand_logo.dart';
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
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AgriColors.canvas,
      appBar: AppBar(
        title: Text('Create account', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (_step > 1) {
              setState(() => _step--);
            } else {
              Navigator.of(context).pop();
            }
          },
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const BrandLogo(compact: true),
                const SizedBox(height: 20),
                Text(
                  'Step $_step of 3',
                  style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w600, color: AgriColors.forest),
                ),
                const SizedBox(height: 4),
                Text(
                  _step == 1 ? 'Your details' : _step == 2 ? 'Location' : 'Security',
                  style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.w700, color: AgriColors.ink),
                ),
                const SizedBox(height: 24),
                if (_step == 1) ...[
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _firstNameController,
                          textCapitalization: TextCapitalization.words,
                          decoration: const InputDecoration(labelText: 'First name'),
                          validator: (value) =>
                              value == null || value.trim().isEmpty ? 'First name is required' : null,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextFormField(
                          controller: _lastNameController,
                          textCapitalization: TextCapitalization.words,
                          decoration: const InputDecoration(labelText: 'Last name'),
                          validator: (value) =>
                              value == null || value.trim().isEmpty ? 'Last name is required' : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String?>(
                    value: _suffix,
                    decoration: const InputDecoration(labelText: 'Suffix (optional)'),
                    items: [
                      const DropdownMenuItem<String?>(value: null, child: Text('None')),
                      ...phSuffixOptions.map(
                        (suffix) => DropdownMenuItem<String?>(value: suffix, child: Text(suffix)),
                      ),
                    ],
                    onChanged: (value) => setState(() => _suffix = value),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    autofillHints: const [AutofillHints.email],
                    decoration: const InputDecoration(labelText: 'Email address'),
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) return 'Email is required';
                      if (!value.contains('@')) return 'Enter a valid email address';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(10)],
                    decoration: InputDecoration(
                      labelText: 'Mobile number',
                      hintText: '9XXXXXXXXX',
                      prefixIcon: Padding(
                        padding: const EdgeInsets.only(left: 12, right: 8),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text('+63', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, color: AgriColors.forest)),
                            Container(
                              width: 1,
                              height: 24,
                              margin: const EdgeInsets.only(left: 8),
                              color: Colors.black12,
                            ),
                          ],
                        ),
                      ),
                      prefixIconConstraints: const BoxConstraints(minWidth: 0, minHeight: 0),
                    ),
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
                  const SizedBox(height: 4),
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
                  TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    autofillHints: const [AutofillHints.newPassword],
                    decoration: InputDecoration(
                      labelText: 'Password',
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                          size: 20,
                          color: AgriColors.muted,
                        ),
                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _confirmPasswordController,
                    obscureText: _obscureConfirmPassword,
                    autofillHints: const [AutofillHints.newPassword],
                    decoration: InputDecoration(
                      labelText: 'Confirm password',
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscureConfirmPassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                          size: 20,
                          color: AgriColors.muted,
                        ),
                        onPressed: () => setState(() => _obscureConfirmPassword = !_obscureConfirmPassword),
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 28),
                AgriButton(
                  label: _step < 3 ? 'Continue' : 'Create account',
                  icon: _step < 3 ? Icons.arrow_forward : Icons.person_add_outlined,
                  loading: _submitting,
                  onPressed: _submitting ? null : _nextStep,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
