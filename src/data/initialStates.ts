import type { IGlobalStorage } from '../core/interfaces';
import { mapData } from './mapData';

export const initialState: IGlobalStorage = {
  player: {
    health: 80,
    hunger: 20,
    sanity: 70,
    dirtiness: 30,
    combatSkill: 5,
    money: 10,
    locationId: 'sewer_hideout',
  },
  runtime: {
    dayNumber: 1,
    gameTime: 480, // 8:00 AM
    isRunning: true,
  },
  map: {
    allLocations: mapData,
  },
};
