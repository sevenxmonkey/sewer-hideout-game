import type { IGlobalStorage } from '../interfaces';
import type { ILocalAction } from '../interfaces/IMapState';
import { itemDefinitions } from '../data/itemData';
import { resolveScavengeAction, applyMarkLocationScavenged } from './scavengeLogic';
import { applyTimeAdvance } from './timelogic';

// Core game rules extracted as pure functions

// 直接修改饱食度（用于事件或道具等单次变化）
export function applySatietyChange(state: IGlobalStorage, delta: number): IGlobalStorage {
  const newSatiety = Math.max(0, Math.min(100, state.player.satiety + delta));
  return {
    ...state,
    player: { ...state.player, satiety: newSatiety },
  };
}

// 改变玩家位置
export function applyLocationSet(state: IGlobalStorage, targetLocationId: string): IGlobalStorage {
  return {
    ...state,
    player: { ...state.player, locationId: targetLocationId },
  };
}

// 向背包增加道具数量
export function applyInventoryItemAdd(
  state: IGlobalStorage,
  itemId: string,
  qty: number = 1
): IGlobalStorage {
  const inv = state.player.inventory ?? [];
  const existingIdx = inv.findIndex((it) => it.id === itemId);
  let newInv;
  if (existingIdx >= 0) {
    newInv = inv.map((it, idx) => (idx === existingIdx ? { ...it, qty: it.qty + qty } : it));
  } else {
    newInv = [...inv, { id: itemId, qty }];
  }
  return {
    ...state,
    player: { ...state.player, inventory: newInv },
  };
}

// 使用背包中的道具，并应用其效果（内部函数，不包含日志）
function applyInventoryItemUseInternal(state: IGlobalStorage, itemId: string): IGlobalStorage {
  const inv = state.player.inventory ?? [];
  const idx = inv.findIndex((it) => it.id === itemId);
  if (idx === -1) return state;

  const newInv = inv.map((it) => ({ ...it }));
  newInv[idx].qty = Math.max(0, newInv[idx].qty - 1);
  if (newInv[idx].qty === 0) newInv.splice(idx, 1);

  const def = itemDefinitions[itemId];
  if (!def) {
    return { ...state, player: { ...state.player, inventory: newInv } };
  }

  let player = { ...state.player, inventory: newInv };
  if (def.type === 'satiety') {
    const newSatiety = Math.max(0, Math.min(100, player.satiety + def.value));
    player = { ...player, satiety: newSatiety };
  } else if (def.type === 'health') {
    const newHealth = Math.max(0, Math.min(100, player.health + def.value));
    player = { ...player, health: newHealth };
  } else if (def.type === 'sanity') {
    const newSanity = Math.max(0, Math.min(100, player.sanity + def.value));
    player = { ...player, sanity: newSanity };
  }

  return { ...state, player };
}

// 使用背包中的道具，并应用其效果和日志
export function applyInventoryItemUse(state: IGlobalStorage, itemId: string): IGlobalStorage {
  const newState = applyInventoryItemUseInternal(state, itemId);
  // 添加道具使用的日志，同时清除 NPC log
  const def = itemDefinitions[itemId];
  if (def) {
    return {
      ...newState,
      runtime: {
        ...newState.runtime,
        localActionLog: 'log.item.used',
        npcLog: undefined, // 清除 NPC log
      },
    };
  }
  return newState;
}

// ---------- Command + Effect pipeline (for high-level behaviors) ----------

export type GameCommand =
  | { kind: 'MOVE_TO'; targetLocationId: string; timeCostMinutes: number }
  | { kind: 'PERFORM_LOCAL_ACTION'; action: ILocalAction; timeCostMinutes: number }
  | {
      kind: 'TALK_TO_NPC';
      npcId: string;
      interactionKey: string;
      timeCostMinutes: number;
      scheduleEndMinutes: number; // NPC 出现时间段的结束时间
    }
  | { kind: 'USE_ITEM'; itemId: string; timeCostMinutes: number };

export type GameEffect =
  | { kind: 'TIME_ADVANCE'; minutes: number; isResting?: boolean }
  | { kind: 'LOCATION_SET'; locationId: string }
  | { kind: 'INVENTORY_ADD'; itemId: string; qty: number }
  | { kind: 'INVENTORY_USE'; itemId: string }
  | { kind: 'LOG_LOCAL_ACTION'; messageKey: string }
  | { kind: 'LOG_NPC'; messageKey: string }
  | { kind: 'CLEAR_LOGS' }
  | { kind: 'MARK_LOCATION_SCAVENGED'; locationId: string };

// 把高层行为解析为 effect 列表（不直接修改 state）
export function resolveGameCommand(state: IGlobalStorage, command: GameCommand): GameEffect[] {
  switch (command.kind) {
    case 'MOVE_TO': {
      const effects: GameEffect[] = [
        { kind: 'CLEAR_LOGS' },
        { kind: 'TIME_ADVANCE', minutes: command.timeCostMinutes },
        { kind: 'LOCATION_SET', locationId: command.targetLocationId },
      ];
      return effects;
    }
    case 'PERFORM_LOCAL_ACTION': {
      const effects: GameEffect[] = [{ kind: 'TIME_ADVANCE', minutes: command.timeCostMinutes }];
      const action = command.action;
      const locationId = state.player.locationId;

      // 如果是搜刮行为
      if (
        action.nextActionType.startsWith('SCAVENGE') &&
        action.lootTable &&
        action.lootTable.length > 0
      ) {
        return resolveScavengeAction(state, action, locationId);
      } else if (action.nextActionType.startsWith('REST')) {
        effects.push({ kind: 'LOG_LOCAL_ACTION', messageKey: 'log.action.rest' });
        // 休息时，时间推进需要标记为休息状态，以便理智恢复而不是减少
        effects[0] = { kind: 'TIME_ADVANCE', minutes: command.timeCostMinutes, isResting: true };
      } else if (action.nextActionType.startsWith('TRADE')) {
        effects.push({ kind: 'LOG_LOCAL_ACTION', messageKey: 'log.action.trade' });
      }
      return effects;
    }
    case 'TALK_TO_NPC': {
      const effects: GameEffect[] = [
        { kind: 'TIME_ADVANCE', minutes: command.timeCostMinutes },
        { kind: 'LOG_NPC', messageKey: command.interactionKey },
      ];
      // 检查对话后时间是否会超出 NPC 出现时间段
      const currentMinutes = state.runtime.gameTime % 1440;
      const totalMinutes = currentMinutes + command.timeCostMinutes;
      const willExceedSchedule =
        totalMinutes >= command.scheduleEndMinutes || // 超出时间段结束时间
        totalMinutes >= 1440; // 跨天（无论 scheduleEndMinutes 是多少，跨天都应该清除）
      if (willExceedSchedule) {
        effects.push({ kind: 'CLEAR_LOGS' });
      }
      return effects;
    }
    case 'USE_ITEM': {
      const effects: GameEffect[] = [
        { kind: 'TIME_ADVANCE', minutes: command.timeCostMinutes },
        { kind: 'INVENTORY_USE', itemId: command.itemId },
      ];
      return effects;
    }
    default:
      return [];
  }
}

// 单个 effect 如何作用在 state 上
export function applyGameEffect(state: IGlobalStorage, effect: GameEffect): IGlobalStorage {
  switch (effect.kind) {
    case 'TIME_ADVANCE':
      return applyTimeAdvance(state, effect.minutes, effect.isResting ?? false);
    case 'LOCATION_SET':
      return applyLocationSet(state, effect.locationId);
    case 'INVENTORY_ADD':
      return applyInventoryItemAdd(state, effect.itemId, effect.qty);
    case 'INVENTORY_USE':
      return applyInventoryItemUse(state, effect.itemId);
    case 'LOG_LOCAL_ACTION':
      return {
        ...state,
        runtime: {
          ...state.runtime,
          localActionLog: effect.messageKey,
          npcLog: undefined, // 清除 NPC log
        },
      };
    case 'LOG_NPC':
      return {
        ...state,
        runtime: {
          ...state.runtime,
          npcLog: effect.messageKey,
          localActionLog: undefined, // 清除 local action log
        },
      };
    case 'CLEAR_LOGS':
      return {
        ...state,
        runtime: {
          ...state.runtime,
          localActionLog: undefined,
          npcLog: undefined,
        },
      };
    case 'MARK_LOCATION_SCAVENGED':
      return applyMarkLocationScavenged(state, effect.locationId);
    default:
      return state;
  }
}

// 顺序应用多个 effect
export function applyGameEffects(state: IGlobalStorage, effects: GameEffect[]): IGlobalStorage {
  return effects.reduce(applyGameEffect, state);
}
