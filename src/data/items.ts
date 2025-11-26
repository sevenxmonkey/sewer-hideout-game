import type { IItemDefinition } from '../interfaces/IItem';

export const itemDefinitions: Record<string, IItemDefinition> = {
  apple: {
    id: 'apple',
    nameKey: 'item.apple.name',
    descriptionKey: 'item.apple.desc',
    type: 'satiety',
    value: 15, // restores satiety by 15
  },
  bread: {
    id: 'bread',
    nameKey: 'item.bread.name',
    descriptionKey: 'item.bread.desc',
    type: 'satiety',
    value: 10,
  },
  canned_beans: {
    id: 'canned_beans',
    nameKey: 'item.canned_beans.name',
    descriptionKey: 'item.canned_beans.desc',
    type: 'satiety',
    value: 30,
  },
  soup: {
    id: 'soup',
    nameKey: 'item.soup.name',
    descriptionKey: 'item.soup.desc',
    type: 'satiety',
    value: 20,
  },
  bandage: {
    id: 'bandage',
    nameKey: 'item.bandage.name',
    descriptionKey: 'item.bandage.desc',
    type: 'health',
    value: 20,
  },
  medkit: {
    id: 'medkit',
    nameKey: 'item.medkit.name',
    descriptionKey: 'item.medkit.desc',
    type: 'health',
    value: 50,
  },
  coffee: {
    id: 'coffee',
    nameKey: 'item.coffee.name',
    descriptionKey: 'item.coffee.desc',
    type: 'sanity',
    value: 10,
  },
  sweets: {
    id: 'sweets',
    nameKey: 'item.sweets.name',
    descriptionKey: 'item.sweets.desc',
    type: 'sanity',
    value: 8,
  },
};
