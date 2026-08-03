import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../config/theme.dart';

class AuthTextField extends StatelessWidget {
  const AuthTextField({
    super.key,
    required this.label,
    this.controller,
    this.hint,
    this.keyboardType,
    this.obscureText = false,
    this.suffixIcon,
    this.validator,
    this.onChanged,
    this.inputFormatters,
    this.autofillHints,
    this.textCapitalization = TextCapitalization.none,
    this.maxLength,
    this.prefix,
  });

  final String label;
  final TextEditingController? controller;
  final String? hint;
  final TextInputType? keyboardType;
  final bool obscureText;
  final Widget? suffixIcon;
  final Widget? prefix;
  final String? Function(String?)? validator;
  final ValueChanged<String>? onChanged;
  final List<TextInputFormatter>? inputFormatters;
  final Iterable<String>? autofillHints;
  final TextCapitalization textCapitalization;
  final int? maxLength;

  static const _radius = 28.0;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AgriColors.ink.withValues(alpha: 0.88),
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          obscureText: obscureText,
          validator: validator,
          onChanged: onChanged,
          inputFormatters: inputFormatters,
          autofillHints: autofillHints,
          textCapitalization: textCapitalization,
          maxLength: maxLength,
          style: GoogleFonts.poppins(fontSize: 15, color: AgriColors.ink),
          decoration: InputDecoration(
            hintText: hint,
            counterText: '',
            prefixIcon: prefix,
            suffixIcon: suffixIcon,
            filled: true,
            fillColor: Colors.white,
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            hintStyle: GoogleFonts.poppins(fontSize: 15, color: AgriColors.muted.withValues(alpha: 0.75)),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(_radius),
              borderSide: BorderSide(color: AgriColors.ink.withValues(alpha: 0.08)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(_radius),
              borderSide: BorderSide(color: AgriColors.ink.withValues(alpha: 0.08)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(_radius),
              borderSide: BorderSide(color: AgriColors.forest.withValues(alpha: 0.55), width: 1.5),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(_radius),
              borderSide: const BorderSide(color: AgriColors.danger),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(_radius),
              borderSide: const BorderSide(color: AgriColors.danger, width: 1.5),
            ),
          ),
        ),
      ],
    );
  }
}

class AuthPasswordField extends StatefulWidget {
  const AuthPasswordField({
    super.key,
    required this.label,
    this.controller,
    this.hint,
    this.validator,
    this.autofillHints,
  });

  final String label;
  final TextEditingController? controller;
  final String? hint;
  final String? Function(String?)? validator;
  final Iterable<String>? autofillHints;

  @override
  State<AuthPasswordField> createState() => _AuthPasswordFieldState();
}

class _AuthPasswordFieldState extends State<AuthPasswordField> {
  bool _visible = false;

  @override
  Widget build(BuildContext context) {
    return AuthTextField(
      label: widget.label,
      controller: widget.controller,
      hint: widget.hint ?? '••••••••',
      obscureText: !_visible,
      autofillHints: widget.autofillHints,
      validator: widget.validator,
      suffixIcon: IconButton(
        onPressed: () => setState(() => _visible = !_visible),
        icon: Icon(
          _visible ? Icons.visibility_off_outlined : Icons.visibility_outlined,
          size: 20,
          color: AgriColors.muted,
        ),
      ),
    );
  }
}

class AuthDropdownField<T> extends StatelessWidget {
  const AuthDropdownField({
    super.key,
    required this.label,
    required this.value,
    required this.items,
    required this.onChanged,
  });

  final String label;
  final T? value;
  final List<DropdownMenuItem<T>> items;
  final ValueChanged<T?>? onChanged;

  static const _radius = 28.0;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AgriColors.ink.withValues(alpha: 0.88),
          ),
        ),
        const SizedBox(height: 8),
        InputDecorator(
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(_radius),
              borderSide: BorderSide(color: AgriColors.ink.withValues(alpha: 0.08)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(_radius),
              borderSide: BorderSide(color: AgriColors.ink.withValues(alpha: 0.08)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(_radius),
              borderSide: BorderSide(color: AgriColors.forest.withValues(alpha: 0.55), width: 1.5),
            ),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<T>(
              isExpanded: true,
              value: items.any((item) => item.value == value) ? value : null,
              hint: Text('Select…', style: GoogleFonts.poppins(color: AgriColors.muted, fontSize: 15)),
              style: GoogleFonts.poppins(fontSize: 15, color: AgriColors.ink),
              items: items,
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }
}

class AuthPhoneField extends StatelessWidget {
  const AuthPhoneField({
    super.key,
    required this.controller,
    this.validator,
    this.onChanged,
  });

  final TextEditingController controller;
  final String? Function(String?)? validator;
  final ValueChanged<String>? onChanged;

  @override
  Widget build(BuildContext context) {
    return AuthTextField(
      label: 'Mobile number',
      controller: controller,
      hint: '9XXXXXXXXX',
      keyboardType: TextInputType.phone,
      maxLength: 10,
      validator: validator,
      onChanged: onChanged,
      inputFormatters: [
        FilteringTextInputFormatter.digitsOnly,
        LengthLimitingTextInputFormatter(10),
      ],
      prefix: Padding(
        padding: const EdgeInsets.only(left: 16, right: 4),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '+63',
              style: GoogleFonts.poppins(fontWeight: FontWeight.w600, color: AgriColors.forest, fontSize: 15),
            ),
            Container(
              width: 1,
              height: 22,
              margin: const EdgeInsets.only(left: 10),
              color: AgriColors.ink.withValues(alpha: 0.08),
            ),
          ],
        ),
      ),
    );
  }
}
