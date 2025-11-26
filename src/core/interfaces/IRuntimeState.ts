/**
 * B. 运行时状态 (Runtime State)
 */

/**
 * @interface IRuntimeState
 * 描述游戏世界的当前状态和时间流逝。
 */
export interface IRuntimeState {
  dayNumber: number;
  gameTime: number; // 以分钟计，0到 1440 (24 * 60)
  isRunning: boolean; // 游戏是否在运行 (未暂停/未结束)
  accumulatedMinutes?: number; // 用于累计不足 60 分钟的时间，供饥饿计算使用（可选，默认为 0）

  // 未来可扩展：majorDecisions: Set<string> (存储关键剧情抉择)
}
