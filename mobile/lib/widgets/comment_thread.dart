import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../config/theme.dart';
import '../models/incident.dart';
import '../models/post_comment.dart';
import '../utils/community_utils.dart';
import 'evidence_lightbox.dart';

class CommentThread extends StatelessWidget {
  const CommentThread({
    super.key,
    required this.comment,
    required this.galleryComments,
    required this.onReply,
    this.depth = 0,
  });

  final PostComment comment;
  final List<PostComment> galleryComments;
  final ValueChanged<int> onReply;
  final int depth;

  String? _badgeLabel(String? role) {
    if (role == 'municipal_office') return 'MAO';
    if (role == 'farmer') return 'Community';
    return null;
  }

  void _openImage(BuildContext context) {
    final images = galleryComments
        .map((item) => IncidentMedia(id: item.id, url: item.displayImageUrl!, type: 'photo'))
        .toList();
    final index = galleryComments.indexWhere((item) => item.id == comment.id);
    if (index < 0) return;
    EvidenceLightbox.show(context, images: images, initialIndex: index);
  }

  @override
  Widget build(BuildContext context) {
    final badge = _badgeLabel(comment.authorRole);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          margin: EdgeInsets.only(left: depth * 16.0, bottom: 12),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AgriColors.canvas,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Wrap(
                      spacing: 8,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Text(comment.authorName, style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600)),
                        if (badge != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: badge == 'MAO'
                                  ? AgriColors.sky.withValues(alpha: 0.12)
                                  : AgriColors.forest.withValues(alpha: 0.08),
                              borderRadius: BorderRadius.circular(99),
                            ),
                            child: Text(
                              badge,
                              style: GoogleFonts.poppins(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: badge == 'MAO' ? AgriColors.sky : AgriColors.forest,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  Text(formatPostDate(comment.createdAt), style: GoogleFonts.poppins(fontSize: 10, color: AgriColors.muted)),
                ],
              ),
              if (comment.hasBody) ...[
                const SizedBox(height: 6),
                Text(comment.body, style: GoogleFonts.poppins(fontSize: 13)),
              ],
              if (comment.hasImage) ...[
                const SizedBox(height: 10),
                GestureDetector(
                  onTap: () => _openImage(context),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.network(
                      comment.displayImageUrl!,
                      width: double.infinity,
                      height: 180,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 8),
              GestureDetector(
                onTap: () => onReply(comment.id),
                child: Text(
                  'Reply',
                  style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600, color: AgriColors.forest),
                ),
              ),
            ],
          ),
        ),
        ...comment.replies.map(
          (reply) => CommentThread(
            comment: reply,
            galleryComments: galleryComments,
            onReply: onReply,
            depth: depth + 1,
          ),
        ),
      ],
    );
  }
}
