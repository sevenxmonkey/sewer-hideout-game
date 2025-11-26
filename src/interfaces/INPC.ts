export interface INPCScheduleEntry {
  locationId: string; // 出现的地点 ID，对应 ILocation.id
  startMinutes: number; // 当天开始时间（含），单位：分钟，例如 8:00 -> 480
  endMinutes: number; // 当天结束时间（不含），单位：分钟
  interactionKey: string; // 该时段 & 地点下的交互文案 key
}

export interface INPC {
  id: string; // 唯一 ID，用于逻辑和存储
  nameKey: string; // 本地化键：例如 'npc.mara.name'
  schedule: INPCScheduleEntry[]; // 一天内的多个时间段安排
}
