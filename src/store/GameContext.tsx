import React, { createContext, useContext, useReducer } from 'react';
import type { IGlobalStorage } from '../interfaces';
import type { ILocalAction } from '../interfaces/IMapState';
import { initialState } from '../data/initialStateData';
import {
  applySatietyChange,
  applyInventoryItemUse,
  applyInventoryItemAdd,
  applyLocationSet,
  type GameCommand,
  resolveGameCommand,
  applyGameEffects,
} from '../domain/gameLogic';
import { applyTimeAdvance } from '../domain/timelogic';

type Action =
  | { type: 'GAME_MOVE'; targetLocationId: string }
  | { type: 'GAME_TIME_ADVANCE'; minutes: number }
  | { type: 'GAME_SATIETY_CHANGE'; delta: number }
  | { type: 'GAME_ITEM_USE'; itemId: string }
  | { type: 'GAME_ITEM_ADD'; itemId: string; qty?: number }
  | { type: 'GAME_COMMAND'; command: GameCommand };

type GameContextValue = {
  state: IGlobalStorage;
  moveTo: (targetLocationId: string) => void;
  advanceTime: (minutes: number) => void;
  dispatch: React.Dispatch<Action>;
  consumeItem: (itemId: string) => void;
  performLocalAction: (action: ILocalAction) => void;
  talkToNpc: (npcId: string, interactionKey: string, scheduleEndMinutes: number) => void;
};

const GameContext = createContext<GameContextValue | undefined>(undefined);

function reducer(state: IGlobalStorage, action: Action): IGlobalStorage {
  switch (action.type) {
    case 'GAME_MOVE':
      return applyLocationSet(state, action.targetLocationId);
    case 'GAME_TIME_ADVANCE':
      return applyTimeAdvance(state, action.minutes);
    case 'GAME_SATIETY_CHANGE':
      return applySatietyChange(state, action.delta);
    case 'GAME_ITEM_USE':
      return applyInventoryItemUse(state, action.itemId);
    case 'GAME_ITEM_ADD':
      return applyInventoryItemAdd(state, action.itemId, action.qty);
    case 'GAME_COMMAND': {
      const effects = resolveGameCommand(state, action.command);
      return applyGameEffects(state, effects);
    }
    default:
      return state;
  }
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // helper to advance time centrally and apply hunger effects
  const advanceTime = (minutes: number) => {
    if (minutes <= 0) return;
    // update runtime clock and centralized hunger handled in reducer
    dispatch({ type: 'GAME_TIME_ADVANCE', minutes });
  };

  const moveTo = (targetLocationId: string) => {
    const current = state.map.allLocations[state.player.locationId];
    const exit = current?.exits.find((e) => e.targetLocationId === targetLocationId);
    const timeCostMinutes = exit?.timeCostMinutes ?? 0;
    const command: GameCommand = { kind: 'MOVE_TO', targetLocationId, timeCostMinutes };
    dispatch({ type: 'GAME_COMMAND', command });
  };

  const consumeItem = (itemId: string) => {
    const command: GameCommand = {
      kind: 'USE_ITEM',
      itemId,
      timeCostMinutes: 10,
    };
    dispatch({ type: 'GAME_COMMAND', command });
  };

  const performLocalAction = (action: ILocalAction) => {
    if (!action) return;
    const command: GameCommand = {
      kind: 'PERFORM_LOCAL_ACTION',
      action,
      timeCostMinutes: action.timeCostMinutes,
    };
    dispatch({ type: 'GAME_COMMAND', command });
  };

  const talkToNpc = (npcId: string, interactionKey: string, scheduleEndMinutes: number) => {
    // NPC 对话消耗 5 分钟
    const command: GameCommand = {
      kind: 'TALK_TO_NPC',
      npcId,
      interactionKey,
      timeCostMinutes: 5,
      scheduleEndMinutes,
    };
    dispatch({ type: 'GAME_COMMAND', command });
  };

  return (
    <GameContext.Provider
      value={{ state, moveTo, advanceTime, dispatch, consumeItem, performLocalAction, talkToNpc }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
