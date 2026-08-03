import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../config/theme.dart';
import '../models/incident.dart';

/// Full-screen evidence preview with swipe, pinch-zoom, and keyboard-style nav.
class EvidenceLightbox extends StatefulWidget {
  const EvidenceLightbox({
    super.key,
    required this.images,
    required this.initialIndex,
  });

  final List<IncidentMedia> images;
  final int initialIndex;

  static Future<void> show(
    BuildContext context, {
    required List<IncidentMedia> images,
    required int initialIndex,
  }) {
    if (images.isEmpty) return Future.value();

    return Navigator.of(context).push(
      PageRouteBuilder<void>(
        opaque: false,
        barrierColor: Colors.black87,
        pageBuilder: (context, animation, secondaryAnimation) {
          return FadeTransition(
            opacity: animation,
            child: EvidenceLightbox(images: images, initialIndex: initialIndex),
          );
        },
      ),
    );
  }

  @override
  State<EvidenceLightbox> createState() => _EvidenceLightboxState();
}

class _EvidenceLightboxState extends State<EvidenceLightbox> {
  late final PageController _pageController;
  late int _index;
  final List<TransformationController> _transformControllers = [];

  bool get _hasMultiple => widget.images.length > 1;

  @override
  void initState() {
    super.initState();
    _index = widget.initialIndex.clamp(0, widget.images.length - 1);
    _pageController = PageController(initialPage: _index);
    for (var i = 0; i < widget.images.length; i++) {
      _transformControllers.add(TransformationController());
    }
    _preloadAdjacent(_index);
  }

  @override
  void dispose() {
    _pageController.dispose();
    for (final c in _transformControllers) {
      c.dispose();
    }
    super.dispose();
  }

  void _preloadAdjacent(int index) {
    if (index > 0) {
      precacheImage(NetworkImage(widget.images[index - 1].url), context);
    }
    if (index < widget.images.length - 1) {
      precacheImage(NetworkImage(widget.images[index + 1].url), context);
    }
  }

  void _goTo(int next) {
    if (!_hasMultiple) return;
    _pageController.animateToPage(
      next,
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeOut,
    );
  }

  void _resetZoom(int index) {
    _transformControllers[index].value = Matrix4.identity();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black.withValues(alpha: 0.92),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              child: Row(
                children: [
                  Text(
                    '${_index + 1} of ${widget.images.length}',
                    style: GoogleFonts.poppins(color: Colors.white.withValues(alpha: 0.9), fontSize: 14),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close, color: Colors.white, size: 28),
                    tooltip: 'Close',
                  ),
                ],
              ),
            ),
            Expanded(
              child: Stack(
                alignment: Alignment.center,
                children: [
                  PageView.builder(
                    controller: _pageController,
                    itemCount: widget.images.length,
                    onPageChanged: (i) {
                      setState(() => _index = i);
                      _resetZoom(i);
                      _preloadAdjacent(i);
                    },
                    itemBuilder: (context, i) {
                      final media = widget.images[i];
                      return InteractiveViewer(
                        transformationController: _transformControllers[i],
                        minScale: 1,
                        maxScale: 4,
                        panEnabled: true,
                        child: Center(
                          child: Image.network(
                            media.url,
                            fit: BoxFit.contain,
                            loadingBuilder: (context, child, progress) {
                              if (progress == null) return child;
                              return const Center(
                                child: CircularProgressIndicator(color: AgriColors.forestLight),
                              );
                            },
                            errorBuilder: (_, __, ___) => Icon(
                              Icons.broken_image_outlined,
                              color: Colors.white.withValues(alpha: 0.5),
                              size: 48,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                  if (_hasMultiple) ...[
                    Positioned(
                      left: 8,
                      child: _NavButton(
                        icon: Icons.chevron_left,
                        onPressed: _index > 0 ? () => _goTo(_index - 1) : null,
                      ),
                    ),
                    Positioned(
                      right: 8,
                      child: _NavButton(
                        icon: Icons.chevron_right,
                        onPressed: _index < widget.images.length - 1 ? () => _goTo(_index + 1) : null,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            if (_hasMultiple)
              Padding(
                padding: const EdgeInsets.only(bottom: 16, top: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(widget.images.length, (i) {
                    final active = i == _index;
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      width: active ? 22 : 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: active ? Colors.white : Colors.white.withValues(alpha: 0.35),
                        borderRadius: BorderRadius.circular(3),
                      ),
                    );
                  }),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _NavButton extends StatelessWidget {
  const _NavButton({required this.icon, required this.onPressed});

  final IconData icon;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.black.withValues(alpha: 0.5),
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onPressed,
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Icon(icon, color: onPressed != null ? Colors.white : Colors.white38, size: 28),
        ),
      ),
    );
  }
}
