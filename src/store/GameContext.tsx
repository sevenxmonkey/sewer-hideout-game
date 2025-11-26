import React, { createContext, useContext, useReducer } from 'react';
import type { IGlobalStorage } from '../interfaces';
import { initialState } from '../data/initialStates';

type Action =
  | { type: 'MOVE'; targetLocationId: string }
  | { type: 'ADVANCE_TIME'; minutes: number }
  | { type: 'APPLY_HUNGER_DELTA'; delta: number };

type GameContextValue = {
  state: IGlobalStorage;
  moveTo: (targetLocationId: string) => void;
  advanceTime: (minutes: number) => void;
  dispatch: React.Dispatch<Action>;
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
      const hungerDecrease = Math.floor(totalAccum / 60); // 1 hunger per 60 min
      const newAccum = totalAccum % 60;
      const newHunger = Math.max(0, Math.min(100, state.player.hunger - hungerDecrease));

      return {
        ...state,
        player: { ...state.player, hunger: newHunger },
        runtime: {
          ...state.runtime,
          gameTime: updatedGameTime,
          dayNumber: state.runtime.dayNumber + dayIncrement,
          accumulatedMinutes: newAccum,
        },
      };
    }
    case 'APPLY_HUNGER_DELTA': {
      const newHunger = Math.max(0, Math.min(100, state.player.hunger + action.delta));
      return {
        ...state,
        player: { ...state.player, hunger: newHunger },
      };
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

  return (
    <GameContext.Provider value={{ state, moveTo, advanceTime, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
