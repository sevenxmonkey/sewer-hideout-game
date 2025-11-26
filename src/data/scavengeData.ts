import { itemDefinitions } from './itemData';

type ScavengeActionType =
  | 'SCAVENGE'
  | 'SCAVENGE_TUNNEL'
  | 'SCAVENGE_STATION'
  | 'SCAVENGE_DOCK'
  | 'SCAVENGE_MARKET'
  | 'default';

const defaultPool = Object.keys(itemDefinitions);

const scavengeLootTables: Record<ScavengeActionType, string[]> = {
  SCAVENGE: ['apple', 'bread', 'coffee', 'sweets'],
  SCAVENGE_TUNNEL: ['bread', 'soup', 'bandage'],
  SCAVENGE_STATION: ['canned_beans', 'soup', 'coffee'],
  SCAVENGE_DOCK: ['bread', 'canned_beans', 'medkit'],
  SCAVENGE_MARKET: ['coffee', 'sweets', 'medkit'],
  default: defaultPool,
};

export function getRandomScavengeLoot(actionType: string): string | null {
  const pool = scavengeLootTables[actionType as ScavengeActionType] ?? scavengeLootTables.default;
  if (!pool.length) return null;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx] ?? null;
}
