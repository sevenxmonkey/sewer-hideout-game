import type { INPC, INPCScheduleEntry } from '../interfaces/INPC';

// 一天按 0-1439 分钟计算
const H = (h: number, m: number = 0) => h * 60 + m;

export const npcs: INPC[] = [
  {
    id: 'mara',
    nameKey: 'npc.mara.name',
    schedule: [
      {
        locationId: 'black_market',
        // 下午到深夜都能遇到玛拉，提升遇见概率
        startMinutes: H(14, 0), // 14:00
        endMinutes: H(20, 0), // 20:00
        interactionKey: 'npc.mara.afternoon_black_market',
      },
      {
        locationId: 'black_market',
        startMinutes: H(20, 0), // 20:00
        endMinutes: H(24, 0), // 24:00
        interactionKey: 'npc.mara.night_black_market',
      },
    ],
  },
  {
    id: 'old_thom',
    nameKey: 'npc.old_thom.name',
    schedule: [
      {
        locationId: 'riverside_dock',
        startMinutes: H(5, 0), // 05:00
        endMinutes: H(11, 0), // 11:00
        interactionKey: 'npc.old_thom.morning_dock',
      },
      {
        locationId: 'riverside_dock',
        startMinutes: H(17, 0), // 17:00
        endMinutes: H(21, 0), // 21:00
        interactionKey: 'npc.old_thom.evening_dock',
      },
    ],
  },
  {
    id: 'sister_hana',
    nameKey: 'npc.sister_hana.name',
    schedule: [
      {
        locationId: 'city_streets',
        startMinutes: H(10, 0), // 10:00
        endMinutes: H(16, 0), // 16:00
        interactionKey: 'npc.sister_hana.day_streets',
      },
      {
        locationId: 'sewer_hideout',
        startMinutes: H(21, 0), // 21:00
        endMinutes: H(23, 0), // 23:00
        interactionKey: 'npc.sister_hana.evening_sewer',
      },
    ],
  },
  {
    id: 'rat_king',
    nameKey: 'npc.rat_king.name',
    schedule: [
      {
        locationId: 'underground_tunnel',
        startMinutes: H(20, 0), // 20:00
        endMinutes: H(24, 0), // 24:00
        interactionKey: 'npc.rat_king.night_tunnel',
      },
      {
        locationId: 'underground_tunnel',
        startMinutes: H(0, 0), // 00:00
        endMinutes: H(4, 0), // 04:00
        interactionKey: 'npc.rat_king.dawn_tunnel',
      },
    ],
  },
  {
    id: 'station_doctor',
    nameKey: 'npc.station_doctor.name',
    schedule: [
      {
        locationId: 'abandoned_station',
        startMinutes: H(13, 0), // 13:00
        endMinutes: H(18, 0), // 18:00
        interactionKey: 'npc.station_doctor.day_station',
      },
      {
        locationId: 'abandoned_station',
        startMinutes: H(18, 0), // 18:00
        endMinutes: H(23, 0), // 23:00
        interactionKey: 'npc.station_doctor.night_station',
      },
    ],
  },
];

export interface INpcPresence {
  npc: INPC;
  slot: INPCScheduleEntry;
}

export function getNpcPresencesAt(locationId: string, gameTimeMinutes: number): INpcPresence[] {
  const minutes = gameTimeMinutes % 1440;
  const presences: INpcPresence[] = [];

  for (const npc of npcs) {
    for (const slot of npc.schedule) {
      if (
        slot.locationId === locationId &&
        minutes >= slot.startMinutes &&
        minutes < slot.endMinutes
      ) {
        presences.push({ npc, slot });
        break; // 一个 NPC 同一时间只取第一个符合的时段
      }
    }
  }

  return presences;
}
