import type { IGlobalStorage } from '../interfaces';
import { mapData } from './mapData';
import { generateScavengeState } from '../domain/scavengeLogic';

export const initialState: IGlobalStorage = {
  player: {
    health: 80,
    satiety: 80,
    sanity: 70,
    dirtiness: 30,
    combatSkill: 5,
    money: 10,
    locationId: 'sewer_hideout',
    inventory: [
      { id: 'apple', qty: 3 },
      { id: 'bandage', qty: 1 },
      { id: 'coffee', qty: 2 },
    ],
  },
  runtime: {
    dayNumber: 1,
    gameTime: 480, // 8:00 AM
    isRunning: true,
    scavengeState: generateScavengeState(), // 初始化搜刮状态
  },
  map: {
    allLocations: mapData,
  },
};
