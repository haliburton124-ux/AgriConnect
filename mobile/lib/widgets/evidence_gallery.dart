import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../config/theme.dart';
import '../models/incident.dart';
import 'evidence_lightbox.dart';

/// Thumbnail grid for incident evidence photos with in-app lightbox preview.
class EvidenceGallery extends StatelessWidget {
  const EvidenceGallery({super.key, required this.media});

  final List<IncidentMedia> media;

  @override
  Widget build(BuildContext context) {
    if (media.isEmpty) return const SizedBox.shrink();

    final photos = media.where((m) => m.type == 'photo' && m.url.isNotEmpty).toList();
    final videos = media.where((m) => m.type != 'photo').toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(Icons.photo_library_outlined, size: 18, color: AgriColors.forest),
            const SizedBox(width: 6),
            Text('Evidence', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14)),
          ],
        ),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (var i = 0; i < photos.length; i++)
              _PhotoThumb(
                url: photos[i].url,
                onTap: () => EvidenceLightbox.show(context, images: photos, initialIndex: i),
              ),
            for (var vi = 0; vi < videos.length; vi++)
              Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  color: AgriColors.mutedBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.videocam_outlined, color: AgriColors.muted),
                    const SizedBox(height: 4),
                    Text('Video', style: GoogleFonts.poppins(fontSize: 11, color: AgriColors.muted)),
                  ],
                ),
              ),
          ],
        ),
      ],
    );
  }
}

class _PhotoThumb extends StatelessWidget {
  const _PhotoThumb({required this.url, required this.onTap});

  final String url;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Ink(
          width: 88,
          height: 88,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
            image: DecorationImage(image: NetworkImage(url), fit: BoxFit.cover),
          ),
        ),
      ),
    );
  }
}
