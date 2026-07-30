import 'package:flutter/material.dart';

import '../config/theme.dart';
import 'agri_button.dart';

/// Sticky form footer with Cancel (left) and primary action (right) on wide screens.
class AgriFormFooter extends StatelessWidget {
  const AgriFormFooter({
    super.key,
    required this.cancelLabel,
    required this.confirmLabel,
    required this.onCancel,
    required this.onConfirm,
    this.loading = false,
    this.confirmIcon,
  });

  final String cancelLabel;
  final String confirmLabel;
  final VoidCallback onCancel;
  final VoidCallback? onConfirm;
  final bool loading;
  final IconData? confirmIcon;

  static const _breakpoint = 360.0;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AgriColors.ink.withValues(alpha: 0.06))),
        boxShadow: [
          BoxShadow(
            color: AgriColors.forest.withValues(alpha: 0.08),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
          child: LayoutBuilder(
            builder: (context, constraints) {
              final sideBySide = constraints.maxWidth >= _breakpoint;

              if (sideBySide) {
                return Row(
                  children: [
                    Expanded(
                      child: AgriButton(
                        label: cancelLabel,
                        outline: true,
                        fullWidth: true,
                        onPressed: loading ? null : onCancel,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: AgriButton(
                        label: confirmLabel,
                        icon: confirmIcon,
                        loading: loading,
                        fullWidth: true,
                        onPressed: loading ? null : onConfirm,
                      ),
                    ),
                  ],
                );
              }

              return Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AgriButton(
                    label: confirmLabel,
                    icon: confirmIcon,
                    loading: loading,
                    onPressed: loading ? null : onConfirm,
                  ),
                  const SizedBox(height: 10),
                  AgriButton(
                    label: cancelLabel,
                    outline: true,
                    onPressed: loading ? null : onCancel,
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}
