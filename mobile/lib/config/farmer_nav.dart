import 'package:flutter/material.dart';

class FarmerNavItem {
  const FarmerNavItem({
    required this.label,
    required this.icon,
    required this.selectedIcon,
  });

  final String label;
  final IconData icon;
  final IconData selectedIcon;
}

const farmerNavItems = [
  FarmerNavItem(label: 'Home', icon: Icons.home_outlined, selectedIcon: Icons.home),
  FarmerNavItem(label: 'My Farms', icon: Icons.location_on_outlined, selectedIcon: Icons.location_on),
  FarmerNavItem(label: 'Incidents', icon: Icons.warning_amber_outlined, selectedIcon: Icons.warning_amber),
  FarmerNavItem(label: 'Appointments', icon: Icons.calendar_today_outlined, selectedIcon: Icons.calendar_today),
  FarmerNavItem(label: 'Messages', icon: Icons.chat_bubble_outline, selectedIcon: Icons.chat_bubble),
  FarmerNavItem(label: 'Programs', icon: Icons.card_giftcard_outlined, selectedIcon: Icons.card_giftcard),
  FarmerNavItem(label: 'Knowledge Hub', icon: Icons.menu_book_outlined, selectedIcon: Icons.menu_book),
  FarmerNavItem(label: 'Announcements', icon: Icons.campaign_outlined, selectedIcon: Icons.campaign),
  FarmerNavItem(label: 'Documents', icon: Icons.description_outlined, selectedIcon: Icons.description),
  FarmerNavItem(label: 'Settings', icon: Icons.settings_outlined, selectedIcon: Icons.settings),
];

/// Drawer index for Knowledge Hub screen.
const knowledgeHubNavIndex = 6;
