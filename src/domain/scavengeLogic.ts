import type { IGlobalStorage } from '../interfaces';
import type { ILocalAction } from '../interfaces/IMapState';
import type { GameEffect } from './gameLogic';
import { mapData } from '../data/mapData';

// 从掉落表中随机选择一个物品
function getRandomLootFromTable(lootTable: string[]): string | null {
  if (!lootTable.length) return null;
  const idx = Math.floor(Math.random() * lootTable.length);
  return lootTable[idx] ?? null;
}

// 生成地点今天的掉落物品
function generateDailyLootForLocation(locationId: string): string | null {
  const location = mapData[locationId];
  if (!location) return null;

  // 找到该地点的搜刮 action
  const scavengeAction = location.localActions.find(
    (action) => action.nextActionType.startsWith('SCAVENGE') && action.lootTable
  );
  if (!scavengeAction || !scavengeAction.lootTable || scavengeAction.lootTable.length === 0) {
    return null;
  }

  return getRandomLootFromTable(scavengeAction.lootTable);
}

// 生成所有地点的搜刮状态（纯函数，不依赖 state）
export function generateScavengeState(): {
  [locationId: string]: { lootItemId: string | null; isScavenged: boolean };
} {
  const scavengeState: {
    [locationId: string]: { lootItemId: string | null; isScavenged: boolean };
  } = {};

  // 为所有有搜刮 action 的地点生成新的掉落物品
  for (const locationId in mapData) {
    const location = mapData[locationId];
    const hasScavenge = location.localActions.some((action) =>
      action.nextActionType.startsWith('SCAVENGE')
    );
    if (hasScavenge) {
      scavengeState[locationId] = {
        lootItemId: generateDailyLootForLocation(locationId),
        isScavenged: false,
      };
    }
  }

  return scavengeState;
}

// 处理搜刮行为，返回需要添加的 effects
export function resolveScavengeAction(
  state: IGlobalStorage,
  action: ILocalAction,
  locationId: string
): GameEffect[] {
  const effects: GameEffect[] = [];
  const scavengeState = state.runtime.scavengeState?.[locationId];

  // 检查今天是否已搜刮
  if (scavengeState?.isScavenged) {
    // 已搜刮，显示提示
    effects.push({ kind: 'LOG_LOCAL_ACTION', messageKey: 'log.scavenge.already_scavenged' });
  } else {
    // 未搜刮，使用预生成的掉落物品
    const lootId = scavengeState?.lootItemId ?? getRandomLootFromTable(action.lootTable!);
    if (lootId) {
      effects.push({ kind: 'INVENTORY_ADD', itemId: lootId, qty: 1 });
      effects.push({ kind: 'LOG_LOCAL_ACTION', messageKey: 'log.scavenge.found_generic' });
      effects.push({ kind: 'MARK_LOCATION_SCAVENGED', locationId });
      effects.push({ kind: 'TIME_ADVANCE', minutes: action.timeCostMinutes });
    }
  }

  return effects;
}

// 应用 MARK_LOCATION_SCAVENGED effect
export function applyMarkLocationScavenged(
  state: IGlobalStorage,
  locationId: string
): IGlobalStorage {
  const scavengeState = state.runtime.scavengeState ?? {};
  const locationState = scavengeState[locationId];
  if (!locationState) return state;

  return {
    ...state,
    runtime: {
      ...state.runtime,
      scavengeState: {
        ...scavengeState,
        [locationId]: {
          ...locationState,
          isScavenged: true,
        },
      },
    },
  };
}

// 重置所有地点的搜刮状态（每天0点调用）
export function resetScavengeState(state: IGlobalStorage): IGlobalStorage {
  return {
    ...state,
    runtime: {
      ...state.runtime,
      scavengeState: generateScavengeState(),
    },
  };
}
