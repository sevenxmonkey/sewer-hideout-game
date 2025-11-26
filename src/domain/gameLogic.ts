import type { IGlobalStorage } from '../interfaces';
import type { ILocalAction } from '../interfaces/IMapState';
import { getRandomScavengeLoot } from '../data/scavengeData';
import { itemDefinitions } from '../data/itemData';

// Core game rules extracted as pure functions

// 时间推进（同时处理时间与饱食度衰减）
export function applyTimeAdvance(state: IGlobalStorage, minutes: number): IGlobalStorage {
  if (minutes <= 0) return state;

  const newTime = state.runtime.gameTime + minutes;
  const dayIncrement = Math.floor(newTime / 1440) - Math.floor(state.runtime.gameTime / 1440);
  const updatedGameTime = newTime % 1440;

  const prevAccum = state.runtime.accumulatedMinutes ?? 0;
  const totalAccum = prevAccum + minutes;
  const satietyDecrease = Math.floor(totalAccum / 60);
  const newAccum = totalAccum % 60;
  const newSatiety = Math.max(0, Math.min(100, state.player.satiety - satietyDecrease));

  return {
    ...state,
    player: { ...state.player, satiety: newSatiety },
    runtime: {
      ...state.runtime,
      gameTime: updatedGameTime,
      dayNumber: state.runtime.dayNumber + dayIncrement,
      accumulatedMinutes: newAccum,
    },
  };
}

// 直接修改饱食度（用于事件或道具等单次变化）
export function applySatietyChange(state: IGlobalStorage, delta: number): IGlobalStorage {
  const newSatiety = Math.max(0, Math.min(100, state.player.satiety + delta));
  return {
    ...state,
    player: { ...state.player, satiety: newSatiety },
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

// 使用背包中的道具，并应用其效果
export function applyInventoryItemUse(state: IGlobalStorage, itemId: string): IGlobalStorage {
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

// ---------- Command + Effect pipeline (for high-level behaviors) ----------

export type GameCommand =
  | { kind: 'MOVE_TO'; targetLocationId: string; timeCostMinutes: number }
  | { kind: 'PERFORM_LOCAL_ACTION'; action: ILocalAction; timeCostMinutes: number }
  | { kind: 'TALK_TO_NPC'; npcId: string; interactionKey: string; timeCostMinutes: number };

export type GameEffect =
  | { kind: 'TIME_ADVANCE'; minutes: number }
  | { kind: 'LOCATION_SET'; locationId: string }
  | { kind: 'INVENTORY_ADD'; itemId: string; qty: number }
  | { kind: 'LOG_LOCAL_ACTION'; messageKey: string }
  | { kind: 'LOG_NPC'; messageKey: string }
  | { kind: 'CLEAR_LOGS' };

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
      const actionType = command.action.nextActionType;
      if (actionType && actionType.startsWith('SCAVENGE')) {
        const lootId = getRandomScavengeLoot(actionType);
        if (lootId) {
          effects.push({ kind: 'INVENTORY_ADD', itemId: lootId, qty: 1 });
          effects.push({ kind: 'LOG_LOCAL_ACTION', messageKey: 'log.scavenge.found_generic' });
        }
      } else if (actionType && actionType.startsWith('REST')) {
        effects.push({ kind: 'LOG_LOCAL_ACTION', messageKey: 'log.action.rest' });
      } else if (actionType && actionType.startsWith('TRADE')) {
        effects.push({ kind: 'LOG_LOCAL_ACTION', messageKey: 'log.action.trade' });
      }
      return effects;
    }
    case 'TALK_TO_NPC': {
      const effects: GameEffect[] = [
        { kind: 'TIME_ADVANCE', minutes: command.timeCostMinutes },
        { kind: 'LOG_NPC', messageKey: command.interactionKey },
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
      return applyTimeAdvance(state, effect.minutes);
    case 'LOCATION_SET':
      return {
        ...state,
        player: { ...state.player, locationId: effect.locationId },
      };
    case 'INVENTORY_ADD':
      return applyInventoryItemAdd(state, effect.itemId, effect.qty);
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
    default:
      return state;
  }
}

// 顺序应用多个 effect
export function applyGameEffects(state: IGlobalStorage, effects: GameEffect[]): IGlobalStorage {
  return effects.reduce(applyGameEffect, state);
}
