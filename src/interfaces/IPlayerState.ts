import { IItemInstance } from './IItem';

/**
 * @interface IPlayerState
 * 描述主角的当前状态和属性。
 */
export interface IPlayerState {
  health: number; // 健康值 (0-100)
  satiety: number; // 饱食度 (0-100, 越高越饱)
  sanity: number; // 精神值 (0-100)
  dirtiness: number; // 干净值 (0-100, 越高越脏)
  combatSkill: number; // 武力值
  money: number; // 金钱
  locationId: string; // 当前地点 ID (关联 ILocation)

  // inventory 简单实现
  inventory?: IItemInstance[];
}
