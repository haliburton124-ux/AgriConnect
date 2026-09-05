import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class AdvisoryCategory {
  const AdvisoryCategory({required this.value, required this.label, required this.icon});

  final String? value;
  final String label;
  final IconData icon;
}

const advisoryCategories = [
  AdvisoryCategory(value: null, label: 'All Topics', icon: Icons.grid_view),
  AdvisoryCategory(value: 'pesticide_usage', label: 'Pesticide Usage', icon: Icons.science_outlined),
  AdvisoryCategory(value: 'crop_disease', label: 'Crop Disease', icon: Icons.biotech_outlined),
  AdvisoryCategory(value: 'soil_management', label: 'Soil Management', icon: Icons.grass_outlined),
  AdvisoryCategory(value: 'suitable_crops', label: 'Suitable Crops', icon: Icons.eco_outlined),
  AdvisoryCategory(value: 'weather_advisory', label: 'Weather Advisory', icon: Icons.wb_sunny_outlined),
  AdvisoryCategory(value: 'planting_calendar', label: 'Planting Calendar', icon: Icons.calendar_month_outlined),
  AdvisoryCategory(value: 'pest_outbreak', label: 'Pest Outbreak', icon: Icons.bug_report_outlined),
  AdvisoryCategory(value: 'irrigation', label: 'Irrigation', icon: Icons.water_drop_outlined),
  AdvisoryCategory(value: 'fertilizer', label: 'Fertilizer', icon: Icons.inventory_2_outlined),
  AdvisoryCategory(value: 'best_practices', label: 'Best Practices', icon: Icons.emoji_events_outlined),
  AdvisoryCategory(value: 'general', label: 'General', icon: Icons.info_outline),
];

const categoryLabels = <String, String>{
  'pesticide_usage': 'Pesticide Usage',
  'crop_disease': 'Crop Disease',
  'soil_management': 'Soil Management',
  'suitable_crops': 'Suitable Crops',
  'weather_advisory': 'Weather Advisory',
  'planting_calendar': 'Planting Calendar',
  'pest_outbreak': 'Pest Outbreak',
  'irrigation': 'Irrigation',
  'fertilizer': 'Fertilizer',
  'best_practices': 'Best Practices',
  'general': 'General',
};

String formatCategory(String category) {
  return categoryLabels[category] ?? category.replaceAll('_', ' ');
}

AdvisoryCategory? findAdvisoryCategoryByLabel(String label) {
  final normalized = label.trim().toLowerCase();
  if (normalized.isEmpty) return null;

  for (final category in advisoryCategories) {
    if (category.label.toLowerCase() == normalized) return category;
  }

  for (final category in advisoryCategories) {
    if (category.value == null) continue;
    final catLabel = category.label.toLowerCase();
    final slug = category.value!.replaceAll('_', ' ');
    if (normalized == category.value ||
        normalized.contains(catLabel) ||
        catLabel.contains(normalized) ||
        normalized.contains(slug) ||
        slug.contains(normalized)) {
      return category;
    }
  }

  return null;
}

String getAdvisoryCategoryLabel(String? value) {
  if (value == null) return 'All Topics';
  return categoryLabels[value] ?? value.replaceAll('_', ' ');
}

String formatPostDate(DateTime date) {
  return DateFormat('MMM d, yyyy').format(date);
}
