import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../config/api_config.dart';
import '../../config/theme.dart';
import '../../core/api/api_exception.dart';
import '../../models/document.dart';
import '../../providers/auth_provider.dart';
import '../../services/document_service.dart';
import '../../widgets/agri_button.dart';
import '../../widgets/agri_page_header.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/loading_view.dart';

class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key});

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  late DocumentService _documents;
  List<AppDocument>? _list;
  bool _loading = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _documents = DocumentService(context.read<AuthProvider>().api);
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final list = await _documents.list();
    if (!mounted) return;
    setState(() {
      _list = list;
      _loading = false;
    });
  }

  Future<void> _upload() async {
    final titleController = TextEditingController(text: 'My document');
    final picked = await FilePicker.platform.pickFiles();
    if (picked == null || picked.files.single.path == null) return;
    if (!mounted) return;

    final saved = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Upload document'),
        content: TextField(
          controller: titleController,
          decoration: const InputDecoration(labelText: 'Title'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Upload'),
          ),
        ],
      ),
    );

    if (saved != true) return;

    try {
      await _documents.upload(title: titleController.text.trim(), filePath: picked.files.single.path!);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Document uploaded.')));
      _load();
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  Future<void> _openDoc(AppDocument doc) async {
    final url = Uri.parse(ApiConfig.storageUrl(doc.filePath));
    await launchUrl(url, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const LoadingView(message: 'Loading documents…');

    final list = _list ?? [];

    return RefreshIndicator(
      onRefresh: _load,
      color: AgriColors.forest,
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          SliverToBoxAdapter(
            child: AgriPageHeader(
              title: 'Documents',
              subtitle: 'Your personal farm documents and uploads.',
              action: IconButton(onPressed: _upload, icon: const Icon(Icons.upload_file, color: AgriColors.forest)),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: AgriButton(label: 'Upload document', icon: Icons.add, onPressed: _upload),
            ),
          ),
          if (list.isEmpty)
            const SliverFillRemaining(
              child: EmptyState(
                icon: Icons.description_outlined,
                title: 'No documents yet',
                description: 'Upload permits, IDs, or farm records here.',
              ),
            )
          else
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final doc = list[index];
                  return ListTile(
                    leading: const Icon(Icons.insert_drive_file, color: AgriColors.forest),
                    title: Text(doc.title),
                    subtitle: Text(doc.category),
                    trailing: IconButton(
                      icon: const Icon(Icons.open_in_new),
                      onPressed: () => _openDoc(doc),
                    ),
                  );
                },
                childCount: list.length,
              ),
            ),
        ],
      ),
    );
  }
}
