import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../core/api/api_exception.dart';
import '../../models/farm.dart';
import '../../providers/auth_provider.dart';
import '../../services/farm_service.dart';
import '../../widgets/agri_farm_card.dart';
import '../../widgets/agri_page_header.dart';
import '../../widgets/agri_button.dart';
import '../../widgets/empty_state.dart';
import 'register_farm_screen.dart';
import '../../widgets/loading_view.dart';
import 'farm_detail_screen.dart';

class FarmsScreen extends StatefulWidget {
  const FarmsScreen({super.key});

  @override
  State<FarmsScreen> createState() => _FarmsScreenState();
}

class _FarmsScreenState extends State<FarmsScreen> {
  FarmService? _farmService;
  List<Farm>? _farms;
  String? _error;
  bool _loading = true;
  bool _started = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    _farmService = FarmService(context.read<AuthProvider>().api);
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final farms = await _farmService!.list();
      if (!mounted) return;
      setState(() {
        _farms = farms;
        _loading = false;
      });
    } on ApiException catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.message;
        _loading = false;
      });
    }
  }

  Future<void> _openRegister({Farm? farm}) async {
    final saved = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => RegisterFarmScreen(farm: farm)),
    );
    if (saved == true) _load();
  }

  Future<void> _deleteFarm(Farm farm) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove farm?'),
        content: Text('Remove "${farm.farmName}"? This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Remove', style: TextStyle(color: AgriColors.danger))),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      await _farmService!.remove(farm.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Farm removed.')));
      _load();
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  void _openFarm(Farm farm) {
    if (!farm.hasValidLocation) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('This farm has no map location yet. Edit the farm and pin it on the map.')),
      );
      return;
    }
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => FarmDetailSheet(farm: farm),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const LoadingView(message: 'Loading your farms…');
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: AgriColors.muted)),
              const SizedBox(height: 16),
              ElevatedButton(onPressed: _load, child: const Text('Retry')),
            ],
          ),
        ),
      );
    }

    final farms = _farms ?? [];

    return RefreshIndicator(
      color: AgriColors.forest,
      onRefresh: _load,
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          SliverToBoxAdapter(
            child: AgriPageHeader(
              title: 'My Farms',
              subtitle: 'Register and manage the farms you report incidents from.',
              action: IconButton(
                tooltip: 'Refresh',
                onPressed: _load,
                icon: const Icon(Icons.refresh, color: AgriColors.forest),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
              child: AgriButton(
                label: 'Register Farm',
                icon: Icons.add,
                onPressed: () => _openRegister(),
              ),
            ),
          ),
          if (farms.isEmpty)
            SliverFillRemaining(
              hasScrollBody: false,
              child: EmptyState(
                icon: Icons.eco,
                title: 'No farms registered yet',
                description: 'Register your first farm to start reporting incidents against it.',
                actionLabel: 'Register Farm',
                onAction: () => _openRegister(),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              sliver: SliverList.separated(
                itemCount: farms.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final farm = farms[index];
                  return AgriFarmCard(
                    farm: farm,
                    onTap: () => _openFarm(farm),
                    onEdit: () => _openRegister(farm: farm),
                    onDelete: () => _deleteFarm(farm),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}
