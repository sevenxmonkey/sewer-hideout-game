/**
 * C. 地图与导航 (Map & Navigation)
 */

export interface IExit {
  targetLocationId: string; // 目标地点 ID
  label: string; // 显示在导航按钮上的文本
  timeCostMinutes: number; // 移动所需的时间
}

export interface ILocalAction {
  labelKey: string; // 动作标签的本地化键
  nextActionType: string; // 动作类型/ID (例如: 'REST_SEWER', 'SCAVENGE')
  timeCostMinutes: number; // 执行所需的时间
  lootTable?: string[]; // 可选：搜刮时的掉落物品列表（仅用于 SCAVENGE 类 action）
}

export interface ILocation {
  id: string; // 唯一 ID: 'sewer_hideout', 'city_streets'
  nameKey: string; // 本地化键 (locales/xx.json 中的键)
  descriptionKey: string; // 场景描述的本地化键

  exits: IExit[]; // 可移动的出口列表
  localActions: ILocalAction[]; // 该地点提供的固定行动
}

export interface IMapState {
  allLocations: { [id: string]: ILocation };
}
