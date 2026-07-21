import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../config/theme.dart';
import '../utils/community_utils.dart';
import '../models/community_post.dart';
import 'expandable_text.dart';

class AdvisoryPostCard extends StatelessWidget {
  const AdvisoryPostCard({
    super.key,
    required this.post,
    required this.onOpen,
    this.onLike,
    this.onShare,
  });

  final CommunityPost post;
  final VoidCallback onOpen;
  final VoidCallback? onLike;
  final VoidCallback? onShare;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.black.withValues(alpha: 0.03)),
        boxShadow: [AgriTheme.cardShadow],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _CategoryBadge(label: formatCategory(post.category)),
                if (post.isSharedInFeed)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AgriColors.gold.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(99),
                    ),
                    child: Text(
                      'Shared to your feed',
                      style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w600, color: AgriColors.gold),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            GestureDetector(
              onTap: onOpen,
              child: Text(
                post.title,
                style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600, color: AgriColors.ink),
              ),
            ),
            const SizedBox(height: 8),
            ExpandableText(text: post.content),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 14, color: AgriColors.forest),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    'Posted by ${post.municipalityName ?? 'Municipal Agriculture Office'} · ${formatPostDate(post.createdAt)}',
                    style: GoogleFonts.poppins(fontSize: 12, color: AgriColors.muted),
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            Row(
              children: [
                _StatIcon(icon: Icons.favorite_border, count: post.likesCount),
                const SizedBox(width: 16),
                _StatIcon(icon: Icons.chat_bubble_outline, count: post.commentsCount),
                const SizedBox(width: 16),
                _StatIcon(icon: Icons.share_outlined, count: post.sharesCount),
                const Spacer(),
                if (onLike != null)
                  _ActionChip(
                    icon: post.likedByMe ? Icons.favorite : Icons.favorite_border,
                    label: 'Like',
                    active: post.likedByMe,
                    onTap: onLike!,
                  ),
                const SizedBox(width: 4),
                _ActionChip(icon: Icons.chat_bubble_outline, label: 'Comment', onTap: onOpen),
                if (onShare != null) ...[
                  const SizedBox(width: 4),
                  _ActionChip(icon: Icons.share_outlined, label: 'Share', onTap: onShare!),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _CategoryBadge extends StatelessWidget {
  const _CategoryBadge({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AgriColors.sky.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(99),
      ),
      child: Text(
        label,
        style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w600, color: AgriColors.sky),
      ),
    );
  }
}

class _StatIcon extends StatelessWidget {
  const _StatIcon({required this.icon, required this.count});

  final IconData icon;
  final int count;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: AgriColors.muted),
        const SizedBox(width: 4),
        Text('$count', style: GoogleFonts.poppins(fontSize: 12, color: AgriColors.muted)),
      ],
    );
  }
}

class _ActionChip extends StatelessWidget {
  const _ActionChip({
    required this.icon,
    required this.label,
    required this.onTap,
    this.active = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool active;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: active ? AgriColors.forest : AgriColors.muted),
            const SizedBox(width: 4),
            Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: active ? AgriColors.forest : AgriColors.muted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
