export type ItemType = 'satiety' | 'sanity' | 'health';

export interface IItemDefinition {
  id: string; // unique id
  nameKey: string; // localization key for item name
  descriptionKey?: string; // optional localization key
  type: ItemType; // which stat it affects
  value: number; // amount to apply (positive increases stat)
}

export interface IItemInstance {
  id: string; // reference to definition id
  qty: number;
}
