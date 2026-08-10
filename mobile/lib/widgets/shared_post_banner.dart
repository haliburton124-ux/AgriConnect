import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../config/theme.dart';
import '../models/community_post.dart';
import '../utils/community_utils.dart';

class SharedPostBanner extends StatelessWidget {
  const SharedPostBanner({
    super.key,
    required this.post,
    this.viewerId,
  });

  final CommunityPost post;
  final int? viewerId;

  @override
  Widget build(BuildContext context) {
    if (!post.hasSharedPostContext) return const SizedBox.shrink();

    final isOwnShare = post.sharedBy?.id == viewerId;
    final sharerLabel = isOwnShare ? 'You' : post.sharedBy?.fullName ?? 'Someone';
    final showFarmerCaptionLabel = !isOwnShare && post.sharedBy?.role == 'farmer';
    final captionLabel = showFarmerCaptionLabel
        ? "Farmer's Caption"
        : isOwnShare
            ? 'Your message'
            : 'Caption';
    final caption = post.shareCaption?.trim();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.share_outlined, size: 16, color: AgriColors.forest),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                'Shared by $sharerLabel'
                '${post.sharedAt != null ? ' · ${formatPostDate(post.sharedAt!)}' : ''}',
                style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w600, color: AgriColors.ink),
              ),
            ),
          ],
        ),
        if (caption != null && caption.isNotEmpty) ...[
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AgriColors.forest.withValues(alpha: 0.03),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AgriColors.forest.withValues(alpha: 0.1)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  captionLabel.toUpperCase(),
                  style: GoogleFonts.poppins(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.5,
                    color: AgriColors.muted,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  caption,
                  style: GoogleFonts.poppins(fontSize: 13, height: 1.45, color: AgriColors.ink),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}
