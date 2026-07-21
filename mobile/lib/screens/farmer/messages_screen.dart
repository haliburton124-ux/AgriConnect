import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../models/message.dart';
import '../../providers/auth_provider.dart';
import '../../services/message_service.dart';
import '../../widgets/agri_page_header.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/loading_view.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  late MessageService _messages;
  List<MessageThread>? _threads;
  int? _partnerId;
  List<ChatMessage>? _conversation;
  final _draftController = TextEditingController();
  bool _loading = true;
  bool _sending = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _messages = MessageService(context.read<AuthProvider>().api);
    _loadThreads();
  }

  @override
  void dispose() {
    _draftController.dispose();
    super.dispose();
  }

  Future<void> _loadThreads() async {
    setState(() => _loading = true);
    final threads = await _messages.threads();
    if (!mounted) return;
    setState(() {
      _threads = threads;
      _loading = false;
    });
  }

  Future<void> _openThread(int partnerId) async {
    setState(() {
      _partnerId = partnerId;
      _conversation = null;
    });
    final msgs = await _messages.conversation(partnerId);
    if (!mounted) return;
    setState(() => _conversation = msgs);
  }

  Future<void> _send(int myId) async {
    final body = _draftController.text.trim();
    if (body.isEmpty || _partnerId == null) return;
    setState(() => _sending = true);
    try {
      await _messages.send(receiverId: _partnerId!, body: body);
      _draftController.clear();
      await _openThread(_partnerId!);
      await _loadThreads();
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final myId = context.watch<AuthProvider>().user?.id;

    if (_loading) return const LoadingView(message: 'Loading messages…');

    if (_partnerId != null && myId != null) {
      final thread = _threads?.where((t) => t.partnerId == _partnerId).firstOrNull;
      return Scaffold(
        backgroundColor: AgriColors.canvas,
        appBar: AppBar(
          title: Text(thread?.partnerName ?? 'Messages'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => setState(() => _partnerId = null),
          ),
        ),
        body: Column(
          children: [
            Expanded(
              child: _conversation == null
                  ? const Center(child: CircularProgressIndicator(color: AgriColors.forest))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _conversation!.length,
                      itemBuilder: (context, index) {
                        final msg = _conversation![index];
                        final mine = msg.senderId == myId;
                        return Align(
                          alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: mine ? AgriColors.forest : Colors.white,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              msg.body,
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                color: mine ? Colors.white : AgriColors.ink,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(8),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _draftController,
                        decoration: InputDecoration(
                          hintText: 'Type a message…',
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(24)),
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: _sending ? null : () => _send(myId),
                      icon: const Icon(Icons.send, color: AgriColors.forest),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    }

    final threads = _threads ?? [];

    return CustomScrollView(
      slivers: [
        const SliverToBoxAdapter(
          child: AgriPageHeader(
            title: 'Messages',
            subtitle: 'Direct conversations with your technician contacts.',
          ),
        ),
        if (threads.isEmpty)
          const SliverFillRemaining(
            child: EmptyState(
              icon: Icons.chat_bubble_outline,
              title: 'No conversations yet',
              description: 'Messages with your contacts will show up here.',
            ),
          )
        else
          SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final t = threads[index];
                return ListTile(
                  leading: CircleAvatar(
                    backgroundColor: AgriColors.forest,
                    child: Text(t.partnerFirstName.isNotEmpty ? t.partnerFirstName[0] : '?', style: const TextStyle(color: Colors.white)),
                  ),
                  title: Text(t.partnerName),
                  subtitle: Text(t.lastBody ?? 'No messages yet', maxLines: 1, overflow: TextOverflow.ellipsis),
                  trailing: t.unreadCount > 0
                      ? CircleAvatar(radius: 10, backgroundColor: AgriColors.gold, child: Text('${t.unreadCount}', style: const TextStyle(fontSize: 10)))
                      : null,
                  onTap: () => _openThread(t.partnerId),
                );
              },
              childCount: threads.length,
            ),
          ),
      ],
    );
  }
}
