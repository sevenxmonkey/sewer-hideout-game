import type { IItemDefinition } from '../interfaces/IItem';

export const itemDefinitions: Record<string, IItemDefinition> = {
  apple: {
    id: 'apple',
    nameKey: 'item.apple.name',
    descriptionKey: 'item.apple.desc',
    type: 'satiety',
    value: 15, // restores satiety by 15
  },
  bandage: {
    id: 'bandage',
    nameKey: 'item.bandage.name',
    descriptionKey: 'item.bandage.desc',
    type: 'health',
    value: 20,
  },
  coffee: {
    id: 'coffee',
    nameKey: 'item.coffee.name',
    descriptionKey: 'item.coffee.desc',
    type: 'sanity',
    value: 10,
  },
};
