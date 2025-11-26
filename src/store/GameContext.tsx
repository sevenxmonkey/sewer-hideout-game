import React, { createContext, useContext, useReducer } from 'react';
import type { IGlobalStorage } from '../interfaces';
import { initialState } from '../data/initialStates';

type Action =
  | { type: 'MOVE'; targetLocationId: string }
  | { type: 'ADVANCE_TIME'; minutes: number }
  | { type: 'APPLY_SATIETY_DELTA'; delta: number }
  | { type: 'USE_ITEM'; itemId: string };

type GameContextValue = {
  state: IGlobalStorage;
  moveTo: (targetLocationId: string) => void;
  advanceTime: (minutes: number) => void;
  dispatch: React.Dispatch<Action>;
  consumeItem: (itemId: string) => void;
};

const GameContext = createContext<GameContextValue | undefined>(undefined);

function reducer(state: IGlobalStorage, action: Action): IGlobalStorage {
  switch (action.type) {
    case 'MOVE': {
      // only change location here; time advancement handled by advanceTime helper
      return {
        ...state,
        player: { ...state.player, locationId: action.targetLocationId },
      };
    }
    case 'ADVANCE_TIME': {
      const newTime = state.runtime.gameTime + action.minutes;
      const dayIncrement = Math.floor(newTime / 1440) - Math.floor(state.runtime.gameTime / 1440);
      const updatedGameTime = newTime % 1440;

      // accumulate leftover minutes for hunger calculation
      const prevAccum = state.runtime.accumulatedMinutes ?? 0;
      const totalAccum = prevAccum + action.minutes;
      const satietyDecrease = Math.floor(totalAccum / 60); // satiety decreases over time
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
    case 'APPLY_SATIETY_DELTA': {
      const newSatiety = Math.max(0, Math.min(100, state.player.satiety + action.delta));
      return {
        ...state,
        player: { ...state.player, satiety: newSatiety },
      };
    }
    case 'USE_ITEM': {
      const itemId = action.itemId;
      const inv = state.player.inventory ?? [];
      const idx = inv.findIndex((it) => it.id === itemId);
      if (idx === -1) return state; // item not found

      // reduce quantity
      const newInv = inv.map((it) => ({ ...it }));
      newInv[idx].qty = Math.max(0, newInv[idx].qty - 1);
      if (newInv[idx].qty === 0) newInv.splice(idx, 1);

      // apply item effect using itemDefinitions
      const { itemDefinitions } = require('../data/items');
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
    dispatch({ type: 'ADVANCE_TIME', minutes });
  };

  const moveTo = (targetLocationId: string) => {
    // find time cost from current location
    const current = state.map.allLocations[state.player.locationId];
    const exit = current?.exits.find((e) => e.targetLocationId === targetLocationId);
    const timeCost = exit?.timeCostMinutes ?? 0;

    // perform move (location change)
    dispatch({ type: 'MOVE', targetLocationId });
    // then centrally advance time (hunger applied in reducer)
    advanceTime(timeCost);
  };

  const consumeItem = (itemId: string) => {
    dispatch({ type: 'USE_ITEM', itemId });
  };

  return (
    <GameContext.Provider value={{ state, moveTo, advanceTime, dispatch, consumeItem }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
