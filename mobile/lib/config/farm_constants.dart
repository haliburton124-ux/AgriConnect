const farmTypes = [
  'rice',
  'corn',
  'vegetable',
  'fruit',
  'livestock',
  'poultry',
  'fishery',
  'mixed',
  'other',
];

const ownershipStatuses = ['owned', 'leased', 'tenant', 'other'];

String formatFarmType(String value) {
  if (value.isEmpty) return value;
  return value[0].toUpperCase() + value.substring(1);
}
