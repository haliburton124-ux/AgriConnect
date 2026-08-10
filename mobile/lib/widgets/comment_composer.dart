import 'dart:io';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';

import '../config/theme.dart';

class CommentComposer extends StatefulWidget {
  const CommentComposer({
    super.key,
    required this.replyToId,
    required this.submitting,
    required this.onSubmit,
    required this.onCancelReply,
  });

  final int? replyToId;
  final bool submitting;
  final Future<void> Function(String body, String? imagePath) onSubmit;
  final VoidCallback onCancelReply;

  @override
  State<CommentComposer> createState() => _CommentComposerState();
}

class _CommentComposerState extends State<CommentComposer> {
  final _controller = TextEditingController();
  final _picker = ImagePicker();
  String? _imagePath;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  bool get _canSubmit => _controller.text.trim().isNotEmpty || (_imagePath != null && _imagePath!.isNotEmpty);

  Future<void> _pickImage(ImageSource source) async {
    final picked = await _picker.pickImage(source: source, imageQuality: 85, maxWidth: 2048);
    if (picked == null || !mounted) return;
    setState(() => _imagePath = picked.path);
  }

  Future<void> _showImageSourceSheet() async {
    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.photo_library_outlined, color: AgriColors.forest),
                title: Text('Choose from gallery', style: GoogleFonts.poppins(fontWeight: FontWeight.w500)),
                onTap: () {
                  Navigator.pop(context);
                  _pickImage(ImageSource.gallery);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_camera_outlined, color: AgriColors.forest),
                title: Text('Take a photo', style: GoogleFonts.poppins(fontWeight: FontWeight.w500)),
                onTap: () {
                  Navigator.pop(context);
                  _pickImage(ImageSource.camera);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (!_canSubmit || widget.submitting) return;
    await widget.onSubmit(_controller.text.trim(), _imagePath);
    if (!mounted) return;
    _controller.clear();
    setState(() => _imagePath = null);
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (widget.replyToId != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text.rich(
                  TextSpan(
                    text: 'Replying to a comment · ',
                    style: GoogleFonts.poppins(fontSize: 12, color: AgriColors.forest),
                    children: [
                      WidgetSpan(
                        child: GestureDetector(
                          onTap: widget.onCancelReply,
                          child: Text(
                            'Cancel',
                            style: GoogleFonts.poppins(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AgriColors.forest,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            if (_imagePath != null) ...[
              Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AgriColors.forest.withValues(alpha: 0.03),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AgriColors.forest.withValues(alpha: 0.1)),
                ),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.file(
                        File(_imagePath!),
                        width: 72,
                        height: 72,
                        fit: BoxFit.cover,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Photo attached', style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              TextButton(
                                onPressed: _showImageSourceSheet,
                                child: const Text('Replace'),
                              ),
                              TextButton(
                                onPressed: () => setState(() => _imagePath = null),
                                child: const Text('Remove', style: TextStyle(color: Colors.red)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
            Row(
              children: [
                IconButton(
                  onPressed: widget.submitting ? null : _showImageSourceSheet,
                  icon: const Icon(Icons.image_outlined, color: AgriColors.forest),
                  tooltip: 'Attach photo',
                ),
                Expanded(
                  child: TextField(
                    controller: _controller,
                    minLines: 1,
                    maxLines: 4,
                    onChanged: (_) => setState(() {}),
                    decoration: InputDecoration(
                      hintText: widget.replyToId != null
                          ? 'Write a reply or attach a photo…'
                          : 'Write a comment or attach a photo…',
                      filled: true,
                      fillColor: AgriColors.canvas,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(24)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    ),
                  ),
                ),
                IconButton(
                  onPressed: (!_canSubmit || widget.submitting) ? null : _submit,
                  icon: widget.submitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AgriColors.forest),
                        )
                      : const Icon(Icons.send, color: AgriColors.forest),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
