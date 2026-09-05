import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../core/api/api_exception.dart';
import '../../models/app_notification.dart';
import '../../providers/auth_provider.dart';
import '../../services/notification_service.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/loading_view.dart';
import 'knowledge_hub_screen.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  late NotificationService _notifications;
  List<AppNotification>? _items;
  int _unreadCount = 0;
  bool _loading = true;
  String? _error;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final api = context.read<AuthProvider>().api;
    _notifications = NotificationService(api);
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final result = await _notifications.list();
      if (!mounted) return;
      setState(() {
        _items = result.notifications;
        _unreadCount = result.unreadCount;
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
        _items = [];
      });
    }
  }

  Future<void> _markAllRead() async {
    await _notifications.markAllAsRead();
    await _load();
  }

  Future<void> _openNotification(AppNotification notification) async {
    if (notification.isUnread) {
      await _notifications.markAsRead(notification.id);
      setState(() {
        _items = _items
            ?.map((item) => item.id == notification.id ? AppNotification(
                  id: item.id,
                  type: item.type,
                  message: item.message,
                  postId: item.postId,
                  commentId: item.commentId,
                  parentCommentId: item.parentCommentId,
                  actorId: item.actorId,
                  actorName: item.actorName,
                  postTitle: item.postTitle,
                  readAt: DateTime.now().toIso8601String(),
                  createdAt: item.createdAt,
                ) : item)
            .toList();
        _unreadCount = (_unreadCount - 1).clamp(0, 999);
      });
    }

    if (notification.postId == null || !mounted) return;

    if (!mounted) return;
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => KnowledgeHubScreen(initialPostId: notification.postId),
      ),
    );
    if (mounted) _load();
  }

  IconData _iconForType(String type) {
    return switch (type) {
      'like' => Icons.favorite_outline,
      'share' => Icons.share_outlined,
      'comment' || 'reply' => Icons.chat_bubble_outline,
      'mention' => Icons.alternate_email,
      _ => Icons.notifications_outlined,
    };
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AgriColors.canvas,
      appBar: AppBar(
        title: Text('Notifications', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        actions: [
          if (_unreadCount > 0)
            TextButton(
              onPressed: _markAllRead,
              child: Text('Mark all read', style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600)),
            ),
        ],
      ),
      body: _loading
          ? const LoadingView(message: 'Loading notifications…')
          : _items == null || _items!.isEmpty
              ? EmptyState(
                  icon: Icons.notifications_outlined,
                  title: _error != null ? 'Could not load notifications' : 'You\'re all caught up.',
                  description: _error ?? 'Likes, comments, replies, and mentions will appear here.',
                )
              : RefreshIndicator(
                  color: AgriColors.forest,
                  onRefresh: _load,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _items!.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final notification = _items![index];
                      return Material(
                        color: notification.isUnread ? AgriColors.forest.withValues(alpha: 0.04) : Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(14),
                          onTap: () => _openNotification(notification),
                          child: Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
                              boxShadow: [AgriTheme.cardShadow],
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(
                                    color: AgriColors.forest.withValues(alpha: 0.1),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(_iconForType(notification.type), size: 20, color: AgriColors.forest),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        notification.message,
                                        style: GoogleFonts.poppins(fontSize: 13, color: AgriColors.ink),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        notification.createdAt,
                                        style: GoogleFonts.poppins(fontSize: 11, color: AgriColors.muted),
                                      ),
                                    ],
                                  ),
                                ),
                                if (notification.isUnread)
                                  Container(
                                    width: 8,
                                    height: 8,
                                    margin: const EdgeInsets.only(top: 6),
                                    decoration: const BoxDecoration(color: AgriColors.gold, shape: BoxShape.circle),
                                  ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
