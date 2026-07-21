import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../config/farmer_nav.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../screens/auth/login_screen.dart';
import '../../screens/farmer/knowledge_hub_screen.dart';
import '../../widgets/brand_logo.dart';
import 'announcements_screen.dart';
import 'appointments_screen.dart';
import 'documents_screen.dart';
import 'farms_screen.dart';
import 'home_screen.dart';
import 'incidents_screen.dart';
import 'messages_screen.dart';
import 'notifications_screen.dart';
import 'programs_screen.dart';
import 'settings_screen.dart';
import '../../services/notification_service.dart';

class FarmerShellScreen extends StatefulWidget {
  const FarmerShellScreen({super.key});

  @override
  State<FarmerShellScreen> createState() => _FarmerShellScreenState();
}

class _FarmerShellScreenState extends State<FarmerShellScreen> {
  int _selectedIndex = 0;
  int _unreadNotifications = 0;
  NotificationService? _notificationService;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _startNotificationPolling());
  }

  void _startNotificationPolling() {
    _refreshUnreadCount();
    Future.delayed(const Duration(seconds: 30), () {
      if (!mounted) return;
      _refreshUnreadCount();
      _startNotificationPolling();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _notificationService ??= NotificationService(context.read<AuthProvider>().api);
    _refreshUnreadCount();
  }

  Future<void> _refreshUnreadCount() async {
    final service = _notificationService;
    if (service == null) return;
    try {
      final count = await service.unreadCount();
      if (mounted) setState(() => _unreadNotifications = count);
    } catch (_) {
      // ignore transient failures
    }
  }

  Future<void> _openNotifications() async {
    await Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const NotificationsScreen()),
    );
    _refreshUnreadCount();
  }

  Future<void> _logout() async {
    await context.read<AuthProvider>().logout();
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (_) => false,
    );
  }

  void _goToKnowledgeHub() => setState(() => _selectedIndex = knowledgeHubNavIndex);

  Widget _buildBody() {
    switch (_selectedIndex) {
      case 0:
        return HomeScreen(
          onOpenKnowledgeHub: _goToKnowledgeHub,
          onExploreServices: _goToKnowledgeHub,
          onReportIncident: () => setState(() => _selectedIndex = 2),
        );
      case 1:
        return const FarmsScreen();
      case 2:
        return const IncidentsScreen();
      case 3:
        return const AppointmentsScreen();
      case 4:
        return const MessagesScreen();
      case 5:
        return const ProgramsScreen();
      case knowledgeHubNavIndex:
        return const KnowledgeHubScreen();
      case 7:
        return const AnnouncementsScreen();
      case 8:
        return const DocumentsScreen();
      case 9:
        return const SettingsScreen();
      default:
        return const HomeScreen();
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final hideAppBar = _selectedIndex == 0;

    return Scaffold(
      backgroundColor: AgriColors.canvas,
      extendBodyBehindAppBar: hideAppBar,
      drawer: _FarmerDrawer(
        selectedIndex: _selectedIndex,
        userName: user?.fullName ?? '',
        userEmail: user?.email ?? '',
        onSelect: (index) {
          setState(() => _selectedIndex = index);
          Navigator.of(context).pop();
        },
        onLogout: _logout,
      ),
      appBar: hideAppBar
          ? null
          : AppBar(
              title: const BrandLogo(compact: true),
              actions: [
                IconButton(
                  tooltip: 'Notifications',
                  onPressed: _openNotifications,
                  icon: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      const Icon(Icons.notifications_outlined),
                      if (_unreadNotifications > 0)
                        Positioned(
                          right: 0,
                          top: 0,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                            decoration: const BoxDecoration(color: AgriColors.gold, shape: BoxShape.circle),
                            child: Text(
                              _unreadNotifications > 9 ? '9+' : '$_unreadNotifications',
                              textAlign: TextAlign.center,
                              style: GoogleFonts.poppins(fontSize: 9, fontWeight: FontWeight.w700, color: Colors.white),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                IconButton(
                  tooltip: 'Messages',
                  onPressed: () => setState(() => _selectedIndex = 4),
                  icon: const Icon(Icons.chat_bubble_outline),
                ),
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedIndex = 9),
                    child: CircleAvatar(
                      radius: 16,
                      backgroundColor: AgriColors.forest,
                      child: Text(
                        user != null && user.fullName.isNotEmpty ? user.fullName[0].toUpperCase() : 'F',
                        style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white),
                      ),
                    ),
                  ),
                ),
              ],
              bottom: PreferredSize(
                preferredSize: const Size.fromHeight(1),
                child: Container(height: 1, color: Colors.black.withValues(alpha: 0.05)),
              ),
            ),
      body: _buildBody(),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _bottomNavIndex,
        onDestinationSelected: (index) {
          setState(() {
            switch (index) {
              case 0:
                _selectedIndex = 0;
              case 1:
                _selectedIndex = 1;
              case 2:
                _selectedIndex = 2;
              case 3:
                _selectedIndex = knowledgeHubNavIndex;
            }
          });
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.agriculture_outlined), selectedIcon: Icon(Icons.agriculture), label: 'Farms'),
          NavigationDestination(icon: Icon(Icons.warning_amber_outlined), selectedIcon: Icon(Icons.warning_amber), label: 'Reports'),
          NavigationDestination(icon: Icon(Icons.menu_book_outlined), selectedIcon: Icon(Icons.menu_book), label: 'Advisories'),
        ],
      ),
    );
  }

  int get _bottomNavIndex {
    if (_selectedIndex == 0) return 0;
    if (_selectedIndex == 1) return 1;
    if (_selectedIndex == 2) return 2;
    if (_selectedIndex == knowledgeHubNavIndex) return 3;
    return 0;
  }
}

class _FarmerDrawer extends StatelessWidget {
  const _FarmerDrawer({
    required this.selectedIndex,
    required this.userName,
    required this.userEmail,
    required this.onSelect,
    required this.onLogout,
  });

  final int selectedIndex;
  final String userName;
  final String userEmail;
  final ValueChanged<int> onSelect;
  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: EdgeInsets.fromLTRB(20, MediaQuery.of(context).padding.top + 20, 20, 20),
            decoration: const BoxDecoration(gradient: AgriColors.primaryGradient),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const BrandLogo(light: true, compact: true),
                const SizedBox(height: 20),
                Text(
                  userName,
                  style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white),
                ),
                const SizedBox(height: 2),
                Text(
                  userEmail,
                  style: GoogleFonts.poppins(fontSize: 12, color: Colors.white70),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: farmerNavItems.length,
              itemBuilder: (context, index) {
                final item = farmerNavItems[index];
                final selected = index == selectedIndex;
                return ListTile(
                  leading: Icon(
                    selected ? item.selectedIcon : item.icon,
                    color: selected ? AgriColors.forest : AgriColors.muted,
                  ),
                  title: Text(
                    item.label,
                    style: GoogleFonts.poppins(
                      fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                      color: selected ? AgriColors.forest : AgriColors.ink,
                    ),
                  ),
                  selected: selected,
                  selectedTileColor: AgriColors.forest.withValues(alpha: 0.08),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  onTap: () => onSelect(index),
                );
              },
            ),
          ),
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.logout, color: AgriColors.danger),
            title: Text(
              'Sign out',
              style: GoogleFonts.poppins(color: AgriColors.danger, fontWeight: FontWeight.w500),
            ),
            onTap: onLogout,
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}
