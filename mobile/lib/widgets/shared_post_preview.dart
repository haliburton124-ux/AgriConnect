import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../config/theme.dart';
import '../models/community_post.dart';
import '../utils/community_utils.dart';
import 'expandable_text.dart';

class SharedPostPreview extends StatelessWidget {
  const SharedPostPreview({
    super.key,
    required this.post,
    this.onTap,
    this.label = 'Original advisory',
  });

  final CommunityPost post;
  final VoidCallback? onTap;
  final String label;

  @override
  Widget build(BuildContext context) {
    final images = post.displayImageUrls;
    final authorLabel = post.author?.fullName.isNotEmpty == true
        ? post.author!.fullName
        : post.municipalityName ?? 'Municipal Agriculture Office';

    final content = Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AgriColors.forest.withValues(alpha: 0.02),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.black.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AgriColors.sky.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(99),
            ),
            child: Text(
              formatCategory(post.category),
              style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w600, color: AgriColors.sky),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            post.title,
            style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w600, color: AgriColors.ink),
          ),
          if (images.isNotEmpty) ...[
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.network(
                images.first,
                width: double.infinity,
                height: 140,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const SizedBox.shrink(),
              ),
            ),
          ],
          const SizedBox(height: 8),
          ExpandableText(text: post.content, maxLines: 4),
          const SizedBox(height: 10),
          Row(
            children: [
              const Icon(Icons.location_on_outlined, size: 14, color: AgriColors.forest),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  '$authorLabel · ${formatPostDate(post.createdAt)}',
                  style: GoogleFonts.poppins(fontSize: 11, color: AgriColors.muted),
                ),
              ),
            ],
          ),
        ],
      ),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: GoogleFonts.poppins(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
            color: AgriColors.muted,
          ),
        ),
        const SizedBox(height: 8),
        if (onTap != null)
          Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: onTap,
              borderRadius: BorderRadius.circular(12),
              child: content,
            ),
          )
        else
          content,
      ],
    );
  }
}
