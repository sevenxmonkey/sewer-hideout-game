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
  accumulatedMinutes?: number; // 用于累计不足 60 分钟的时间，供饱食度计算使用（可选，默认为 0）
  starvedMinutes?: number; // 饱食度为 0 时的累计时间（分钟），用于计算健康惩罚

  localActionLog?: string; // 本地行动/道具使用的日志，对应本地化 key
  npcLog?: string; // NPC 对话的日志，对应本地化 key

  // 搜刮机制：每天0点刷新，记录每个地点今天的掉落物品和是否已搜刮
  scavengeState?: {
    [locationId: string]: {
      lootItemId: string | null; // 今天该地点的掉落物品（null 表示无掉落）
      isScavenged: boolean; // 今天是否已搜刮
    };
  };

  // 未来可扩展：majorDecisions: Set<string> (存储关键剧情抉择)
}
