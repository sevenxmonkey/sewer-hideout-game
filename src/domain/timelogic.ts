import type { IGlobalStorage } from '../interfaces';
import { resetScavengeState } from './scavengeLogic';
import {
  SATIETY_DECREASE_PER_MINUTE,
  SATIETY_THRESHOLD_FOR_HEALTH_DECREASE,
  SANITY_DECREASE_PER_MINUTE,
  SANITY_THRESHOLD_FOR_HEALTH_DECREASE,
  SANITY_INCREASE_PER_MINUTE_WHEN_RESTING,
  HEALTH_DECREASE_PER_MINUTE,
} from '../data/constants';

// 计算饱食度、理智和健康的变化（基于时间推进）
export function calculateSatietyAndHealthChange(
  state: IGlobalStorage,
  minutes: number,
  isResting: boolean = false
): {
  newSatiety: number;
  newSanity: number;
  newHealth: number;
  newAccumulatedMinutes: number;
  newStarvedMinutes: number;
} {
  const prevAccum = state.runtime.accumulatedMinutes ?? 0;
  const totalAccum = prevAccum + minutes;
  // 每分钟降低 SATIETY_DECREASE_PER_MINUTE 饱食度
  const satietyDecrease = totalAccum * SATIETY_DECREASE_PER_MINUTE;
  const newAccum = 0; // 不再需要累计，因为现在是连续计算
  const newSatiety = Math.max(0, Math.min(100, state.player.satiety - satietyDecrease));

  // 休息时理智增加，否则减少
  let newSanity: number;
  if (isResting) {
    // 休息时，每分钟增加 SANITY_INCREASE_PER_MINUTE_WHEN_RESTING 理智值
    const sanityIncrease = minutes * SANITY_INCREASE_PER_MINUTE_WHEN_RESTING;
    newSanity = Math.max(0, Math.min(100, state.player.sanity + sanityIncrease));
  } else {
    // 非休息时，每分钟降低 SANITY_DECREASE_PER_MINUTE 理智值
    const sanityDecrease = minutes * SANITY_DECREASE_PER_MINUTE;
    newSanity = Math.max(0, Math.min(100, state.player.sanity - sanityDecrease));
  }

  // 处理饱食度或理智低于阈值时的健康惩罚：每分钟降低健康（不累加）
  let newHealth = state.player.health;

  if (
    newSatiety < SATIETY_THRESHOLD_FOR_HEALTH_DECREASE ||
    newSanity < SANITY_THRESHOLD_FOR_HEALTH_DECREASE
  ) {
    // 饱食度或理智低于阈值，每分钟降低健康（不累加，只应用一次）
    const healthDecrease = minutes * HEALTH_DECREASE_PER_MINUTE;
    newHealth = Math.max(0, newHealth - healthDecrease);
  }

  return {
    newSatiety,
    newSanity,
    newHealth,
    newAccumulatedMinutes: newAccum,
    newStarvedMinutes: 0, // 不再需要此字段，保留以兼容接口
  };
}

// 时间推进（同时处理时间与饱食度衰减）
export function applyTimeAdvance(
  state: IGlobalStorage,
  minutes: number,
  isResting: boolean = false
): IGlobalStorage {
  if (minutes <= 0) return state;

  const newTime = state.runtime.gameTime + minutes;
  const dayIncrement = Math.floor(newTime / 1440) - Math.floor(state.runtime.gameTime / 1440);
  const updatedGameTime = newTime % 1440;

  // 计算饱食度、理智和健康的变化
  const { newSatiety, newSanity, newHealth, newAccumulatedMinutes, newStarvedMinutes } =
    calculateSatietyAndHealthChange(state, minutes, isResting);

  let newState: IGlobalStorage = {
    ...state,
    player: {
      ...state.player,
      satiety: newSatiety,
      sanity: newSanity,
      health: newHealth,
    },
    runtime: {
      ...state.runtime,
      gameTime: updatedGameTime,
      dayNumber: state.runtime.dayNumber + dayIncrement,
      accumulatedMinutes: newAccumulatedMinutes,
      starvedMinutes: newStarvedMinutes,
    },
  };

  // 如果跨天了，重置搜刮状态
  if (dayIncrement > 0) {
    newState = resetScavengeState(newState);
  }

  return newState;
}
