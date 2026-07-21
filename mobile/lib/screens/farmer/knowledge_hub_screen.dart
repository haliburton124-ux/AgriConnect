import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../core/api/api_exception.dart';
import '../../models/community_post.dart';
import '../../models/post_comment.dart';
import '../../providers/auth_provider.dart';
import '../../services/community_service.dart';
import '../../utils/community_utils.dart';
import '../../widgets/advisory_info_cards.dart';
import '../../widgets/advisory_post_card.dart';
import '../../widgets/agri_page_header.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/expandable_text.dart';
import '../../widgets/loading_view.dart';

enum KnowledgeView { advisories, myFeed }

class KnowledgeHubScreen extends StatefulWidget {
  const KnowledgeHubScreen({super.key, this.initialView = KnowledgeView.advisories, this.initialPostId});

  final KnowledgeView initialView;
  final int? initialPostId;

  @override
  State<KnowledgeHubScreen> createState() => _KnowledgeHubScreenState();
}

class _KnowledgeHubScreenState extends State<KnowledgeHubScreen> {
  late KnowledgeView _view;
  late CommunityService _community;
  List<CommunityPost>? _posts;
  String? _error;
  bool _loading = true;
  bool _started = false;
  bool _openedInitialPost = false;
  String _search = '';
  String? _category;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _view = widget.initialView;
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    _community = CommunityService(context.read<AuthProvider>().api);
    _load();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    final searchParam = _category != null ? null : (_search.isEmpty ? null : _search);

    try {
      final posts = _view == KnowledgeView.myFeed
          ? await _community.feed(category: _category, search: searchParam)
          : await _community.listPosts(category: _category, search: searchParam);
      if (!mounted) return;
      setState(() {
        _posts = posts;
        _loading = false;
      });
      _maybeOpenInitialPost(posts);
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
        _posts = [];
      });
    }
  }

  Future<void> _maybeOpenInitialPost(List<CommunityPost> posts) async {
    final postId = widget.initialPostId;
    if (postId == null || _openedInitialPost || !mounted) return;
    _openedInitialPost = true;

    CommunityPost? post;
    for (final item in posts) {
      if (item.id == postId) {
        post = item;
        break;
      }
    }

    post ??= await _community.getPost(postId);
    if (!mounted) return;
    _openPost(post);
  }

  void _applyQuery(String query) {
    final trimmed = query.trim();
    final categoryMatch = findAdvisoryCategoryByLabel(trimmed);

    if (categoryMatch != null && categoryMatch.value != null) {
      _selectCategory(categoryMatch.value, categoryMatch.label);
      return;
    }

    setState(() {
      _category = null;
      _search = trimmed;
    });
    _load();
  }

  void _selectCategory(String? value, String label) {
    setState(() {
      _category = value;
      _search = value == null ? '' : label;
      _searchController.text = _search;
    });
    _load();
  }

  void _clearFilters() {
    _searchController.clear();
    setState(() {
      _category = null;
      _search = '';
    });
    _load();
  }

  void _openCategoryPicker() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _CategoryPickerSheet(
        selected: _category,
        onSelect: (value, label) {
          Navigator.pop(context);
          _selectCategory(value, label);
        },
      ),
    );
  }

  void _switchView(KnowledgeView view) {
    if (_view == view) return;
    setState(() {
      _view = view;
      _posts = null;
      _loading = true;
    });
    _load();
  }

  Future<void> _like(CommunityPost post) async {
    try {
      final updated = await _community.like(post.id);
      setState(() {
        _posts = _posts?.map((p) => p.id == updated.id ? updated : p).toList();
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  Future<void> _share(CommunityPost post) async {
    try {
      final updated = await _community.share(post.id);
      setState(() {
        _posts = _posts?.map((p) => p.id == updated.id ? updated : p).toList();
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Shared to your feed.')));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  void _openPost(CommunityPost post) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _PostDetailSheet(post: post, community: _community),
    );
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      color: AgriColors.forest,
      onRefresh: _load,
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          SliverToBoxAdapter(
            child: AgriPageHeader(
              title: 'Knowledge Hub',
              subtitle:
                  'Public agricultural advisories on pesticide use, crop disease, soil management, planting calendars, and more — like, comment, and share with fellow farmers.',
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [AgriTheme.cardShadow],
                  border: Border.all(color: Colors.black.withValues(alpha: 0.03)),
                ),
                child: Column(
                  children: [
                    _ViewToggle(view: _view, onChanged: _switchView),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _searchController,
                      onSubmitted: _applyQuery,
                      decoration: InputDecoration(
                        hintText: 'Search advisories…',
                        prefixIcon: const Icon(Icons.search, size: 20, color: AgriColors.muted),
                        suffixIcon: (_search.isNotEmpty || _category != null)
                            ? IconButton(
                                icon: const Icon(Icons.clear, size: 18),
                                onPressed: _clearFilters,
                              )
                            : null,
                        filled: true,
                        fillColor: AgriColors.canvas,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _openCategoryPicker,
                            icon: const Icon(Icons.tune, size: 18),
                            label: Text(
                              _category == null ? 'Browse categories' : getAdvisoryCategoryLabel(_category),
                              overflow: TextOverflow.ellipsis,
                            ),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: _category == null ? AgriColors.ink : AgriColors.forest,
                              side: BorderSide(
                                color: _category == null
                                    ? Colors.black.withValues(alpha: 0.08)
                                    : AgriColors.forest.withValues(alpha: 0.35),
                              ),
                              backgroundColor: _category == null ? Colors.white : AgriColors.forest.withValues(alpha: 0.06),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                            ),
                          ),
                        ),
                        if (_category != null) ...[
                          const SizedBox(width: 8),
                          IconButton(
                            tooltip: 'Clear category',
                            onPressed: () => _selectCategory(null, 'All Topics'),
                            icon: const Icon(Icons.close, size: 20),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
          if (_loading)
            const SliverFillRemaining(child: LoadingView(message: 'Loading advisories…'))
          else if (_posts == null || _posts!.isEmpty)
            SliverFillRemaining(
              hasScrollBody: false,
              child: EmptyState(
                icon: Icons.eco,
                title: _error != null ? 'Could not load advisories' : 'No advisories found.',
                description: _error ?? 'Try a different search or category filter.',
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              sliver: SliverList.separated(
                itemCount: _posts!.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final post = _posts![index];
                  return AdvisoryPostCard(
                    post: post,
                    onOpen: () => _openPost(post),
                    onLike: () => _like(post),
                    onShare: () => _share(post),
                  );
                },
              ),
            ),
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(16, 8, 16, 24),
              child: AdvisoryInfoCards(),
            ),
          ),
        ],
      ),
    );
  }
}

class _ViewToggle extends StatelessWidget {
  const _ViewToggle({required this.view, required this.onChanged});

  final KnowledgeView view;
  final ValueChanged<KnowledgeView> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AgriColors.canvas,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
      ),
      child: Row(
        children: [
          _TabButton(
            label: 'Public Advisories',
            selected: view == KnowledgeView.advisories,
            onTap: () => onChanged(KnowledgeView.advisories),
          ),
          _TabButton(
            label: 'My Feed',
            selected: view == KnowledgeView.myFeed,
            onTap: () => onChanged(KnowledgeView.myFeed),
          ),
        ],
      ),
    );
  }
}

class _TabButton extends StatelessWidget {
  const _TabButton({required this.label, required this.selected, required this.onTap});

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            gradient: selected ? AgriColors.primaryGradient : null,
            borderRadius: BorderRadius.circular(10),
            boxShadow: selected ? [AgriTheme.cardShadow] : null,
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: GoogleFonts.poppins(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: selected ? Colors.white : AgriColors.ink.withValues(alpha: 0.6),
            ),
          ),
        ),
      ),
    );
  }
}

class _CategoryPickerSheet extends StatelessWidget {
  const _CategoryPickerSheet({required this.selected, required this.onSelect});

  final String? selected;
  final void Function(String? value, String label) onSelect;

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.72,
      minChildSize: 0.4,
      maxChildSize: 0.92,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: ListView(
            controller: scrollController,
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(color: Colors.black12, borderRadius: BorderRadius.circular(99)),
                ),
              ),
              const SizedBox(height: 16),
              Text('Browse Categories', style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w700)),
              const SizedBox(height: 4),
              Text(
                'Explore advisories by topic',
                style: GoogleFonts.poppins(fontSize: 13, color: AgriColors.muted),
              ),
              const SizedBox(height: 16),
              ...advisoryCategories.map((category) {
                final isSelected = selected == category.value;
                return ListTile(
                  leading: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AgriColors.forest.withValues(alpha: 0.12)
                          : AgriColors.forest.withValues(alpha: 0.06),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(category.icon, size: 20, color: AgriColors.forest),
                  ),
                  title: Text(
                    category.label,
                    style: GoogleFonts.poppins(
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                      color: isSelected ? AgriColors.forest : AgriColors.ink,
                    ),
                  ),
                  trailing: isSelected ? const Icon(Icons.check, color: AgriColors.forest, size: 20) : null,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  onTap: () => onSelect(category.value, category.label),
                );
              }),
            ],
          ),
        );
      },
    );
  }
}

class _PostDetailSheet extends StatefulWidget {
  const _PostDetailSheet({required this.post, required this.community});

  final CommunityPost post;
  final CommunityService community;

  @override
  State<_PostDetailSheet> createState() => _PostDetailSheetState();
}

class _PostDetailSheetState extends State<_PostDetailSheet> {
  List<PostComment>? _comments;
  bool _loadingComments = true;
  bool _posting = false;
  final _commentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadComments();
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _loadComments() async {
    try {
      final comments = await widget.community.comments(widget.post.id);
      if (!mounted) return;
      setState(() {
        _comments = comments;
        _loadingComments = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _comments = [];
        _loadingComments = false;
      });
    }
  }

  Future<void> _submitComment() async {
    final body = _commentController.text.trim();
    if (body.isEmpty) return;
    setState(() => _posting = true);
    try {
      await widget.community.addComment(widget.post.id, body);
      _commentController.clear();
      await _loadComments();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _posting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final post = widget.post;

    return DraggableScrollableSheet(
      initialChildSize: 0.75,
      minChildSize: 0.4,
      maxChildSize: 0.92,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(color: Colors.black12, borderRadius: BorderRadius.circular(99)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(post.title, style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 8),
                    Text(
                      'Posted by ${post.municipalityName ?? 'Municipal Agriculture Office'} · ${formatPostDate(post.createdAt)}',
                      style: GoogleFonts.poppins(fontSize: 12, color: AgriColors.muted),
                    ),
                    const SizedBox(height: 16),
                    ExpandableText(text: post.content, maxLines: 20),
                    const SizedBox(height: 20),
                    Text('Comments', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    if (_loadingComments)
                      const Padding(
                        padding: EdgeInsets.all(16),
                        child: Center(child: CircularProgressIndicator(color: AgriColors.forest, strokeWidth: 2)),
                      )
                    else if (_comments == null || _comments!.isEmpty)
                      Text('No comments yet. Be the first to comment.', style: GoogleFonts.poppins(fontSize: 13, color: AgriColors.muted))
                    else
                      ..._comments!.map(
                        (c) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AgriColors.canvas,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(c.authorName, style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600)),
                                const SizedBox(height: 4),
                                Text(c.body, style: GoogleFonts.poppins(fontSize: 13)),
                              ],
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              SafeArea(
                top: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _commentController,
                          decoration: InputDecoration(
                            hintText: 'Write a comment…',
                            filled: true,
                            fillColor: AgriColors.canvas,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(24)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: _posting ? null : _submitComment,
                        icon: _posting
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                            : const Icon(Icons.send, color: AgriColors.forest),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
