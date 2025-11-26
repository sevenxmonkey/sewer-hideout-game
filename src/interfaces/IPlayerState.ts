/**
 * A. 玩家状态 (Player State)
 */

/**
 * @interface IPlayerState
 * 描述主角的当前状态和属性。
 */
export interface IPlayerState {
  health: number; // 健康值 (0-100)
  hunger: number; // 饱食度度 (0-100, 越高越饿)
  sanity: number; // 精神值 (0-100)
  dirtiness: number; // 干净值 (0-100, 越高越脏)
  combatSkill: number; // 武力值
  money: number; // 金钱
  locationId: string; // 当前地点 ID (关联 ILocation)

  // 未来可扩展：inventory: IItemInstance[]
}
