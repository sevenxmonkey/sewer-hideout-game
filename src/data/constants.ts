/**
 * 游戏常量配置
 */

// 饱食度相关
export const SATIETY_DECREASE_PER_MINUTE = 0.07; // 每分钟降低的饱食度（正常速率）
export const SATIETY_HIGH_THRESHOLD = 80; // 饱食度高于此值时，下降速度减半
export const SATIETY_THRESHOLD_FOR_HEALTH_DECREASE = 10; // 饱食度低于此值时开始降低健康

// 理智相关
export const SANITY_DECREASE_PER_MINUTE = 0.05; // 每分钟降低的理智值
export const SANITY_THRESHOLD_FOR_HEALTH_DECREASE = 10; // 理智低于此值时开始降低健康
export const SANITY_INCREASE_PER_MINUTE_WHEN_RESTING = 0.2; // 休息时每分钟增加的理智值

// 健康相关
export const HEALTH_DECREASE_PER_MINUTE = 0.1; // 饱食度或理智低于阈值时，每分钟降低的健康值（不累加）
export const HEALTH_HIGH_THRESHOLD = 80; // 健康值高于此值时，下降速度减为正常值的 0.2 倍
