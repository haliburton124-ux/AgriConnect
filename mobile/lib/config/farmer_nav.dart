import 'package:flutter/material.dart';

class FarmerNavDestination {
  const FarmerNavDestination({
    required this.label,
    required this.icon,
    required this.selectedIcon,
    required this.shellIndex,
    this.showInDrawer = true,
  });

  final String label;
  final IconData icon;
  final IconData selectedIcon;
  final int shellIndex;
  final bool showInDrawer;
}

/// Internal shell indices — stable even when drawer items are hidden.
const farmerShellHome = 0;
const farmerShellFarms = 1;
const farmerShellIncidents = 2;
const farmerShellAppointments = 3;
const farmerShellMessages = 4;
const farmerShellPrograms = 5;
const farmerShellKnowledgeHub = 6;
const farmerShellAnnouncements = 7;
const farmerShellDocuments = 8;
const farmerShellSettings = 9;

const farmerDestinations = [
  FarmerNavDestination(
    label: 'Home',
    icon: Icons.home_outlined,
    selectedIcon: Icons.home,
    shellIndex: farmerShellHome,
  ),
  FarmerNavDestination(
    label: 'My Farms',
    icon: Icons.location_on_outlined,
    selectedIcon: Icons.location_on,
    shellIndex: farmerShellFarms,
  ),
  FarmerNavDestination(
    label: 'Incidents',
    icon: Icons.warning_amber_outlined,
    selectedIcon: Icons.warning_amber,
    shellIndex: farmerShellIncidents,
  ),
  FarmerNavDestination(
    label: 'Appointments',
    icon: Icons.calendar_today_outlined,
    selectedIcon: Icons.calendar_today,
    shellIndex: farmerShellAppointments,
  ),
  FarmerNavDestination(
    label: 'Messages',
    icon: Icons.chat_bubble_outline,
    selectedIcon: Icons.chat_bubble,
    shellIndex: farmerShellMessages,
    showInDrawer: false,
  ),
  FarmerNavDestination(
    label: 'Programs',
    icon: Icons.card_giftcard_outlined,
    selectedIcon: Icons.card_giftcard,
    shellIndex: farmerShellPrograms,
  ),
  FarmerNavDestination(
    label: 'Knowledge Hub',
    icon: Icons.menu_book_outlined,
    selectedIcon: Icons.menu_book,
    shellIndex: farmerShellKnowledgeHub,
    showInDrawer: false,
  ),
  FarmerNavDestination(
    label: 'Announcements',
    icon: Icons.campaign_outlined,
    selectedIcon: Icons.campaign,
    shellIndex: farmerShellAnnouncements,
    showInDrawer: false,
  ),
  FarmerNavDestination(
    label: 'Documents',
    icon: Icons.description_outlined,
    selectedIcon: Icons.description,
    shellIndex: farmerShellDocuments,
  ),
  FarmerNavDestination(
    label: 'Settings',
    icon: Icons.settings_outlined,
    selectedIcon: Icons.settings,
    shellIndex: farmerShellSettings,
  ),
];

List<FarmerNavDestination> get farmerDrawerDestinations =>
    farmerDestinations.where((destination) => destination.showInDrawer).toList(growable: false);

/// Bottom-nav "Advisories" tab opens Knowledge Hub.
const knowledgeHubNavIndex = farmerShellKnowledgeHub;
