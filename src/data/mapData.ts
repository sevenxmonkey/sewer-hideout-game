import type { ILocation } from '../interfaces/IMapState';

export const mapData: { [id: string]: ILocation } = {
  sewer_hideout: {
    id: 'sewer_hideout',
    nameKey: 'location.sewer_hideout.name',
    descriptionKey: 'location.sewer_hideout.desc',
    exits: [
      {
        targetLocationId: 'city_streets',
        label: 'location.city_streets.name',
        timeCostMinutes: 10,
      },
      {
        targetLocationId: 'underground_tunnel',
        label: 'location.underground_tunnel.name',
        timeCostMinutes: 5,
      },
      {
        targetLocationId: 'abandoned_station',
        label: 'location.abandoned_station.name',
        timeCostMinutes: 15,
      },
    ],
    localActions: [{ labelKey: 'action.rest', nextActionType: 'REST_SEWER', timeCostMinutes: 60 }],
  },
  city_streets: {
    id: 'city_streets',
    nameKey: 'location.city_streets.name',
    descriptionKey: 'location.city_streets.desc',
    exits: [
      {
        targetLocationId: 'sewer_hideout',
        label: 'location.sewer_hideout.name',
        timeCostMinutes: 10,
      },
      {
        targetLocationId: 'riverside_dock',
        label: 'location.riverside_dock.name',
        timeCostMinutes: 20,
      },
    ],
    localActions: [
      { labelKey: 'action.scavenge', nextActionType: 'SCAVENGE', timeCostMinutes: 30 },
    ],
  },

  // new locations
  underground_tunnel: {
    id: 'underground_tunnel',
    nameKey: 'location.underground_tunnel.name',
    descriptionKey: 'location.underground_tunnel.desc',
    exits: [
      {
        targetLocationId: 'sewer_hideout',
        label: 'location.sewer_hideout.name',
        timeCostMinutes: 5,
      },
      {
        targetLocationId: 'abandoned_station',
        label: 'location.abandoned_station.name',
        timeCostMinutes: 8,
      },
    ],
    localActions: [
      { labelKey: 'action.scavenge', nextActionType: 'SCAVENGE_TUNNEL', timeCostMinutes: 20 },
    ],
  },

  abandoned_station: {
    id: 'abandoned_station',
    nameKey: 'location.abandoned_station.name',
    descriptionKey: 'location.abandoned_station.desc',
    exits: [
      {
        targetLocationId: 'sewer_hideout',
        label: 'location.sewer_hideout.name',
        timeCostMinutes: 15,
      },
      {
        targetLocationId: 'underground_tunnel',
        label: 'location.underground_tunnel.name',
        timeCostMinutes: 8,
      },
      {
        targetLocationId: 'black_market',
        label: 'location.black_market.name',
        timeCostMinutes: 12,
      },
    ],
    localActions: [
      { labelKey: 'action.scavenge', nextActionType: 'SCAVENGE_STATION', timeCostMinutes: 45 },
    ],
  },

  riverside_dock: {
    id: 'riverside_dock',
    nameKey: 'location.riverside_dock.name',
    descriptionKey: 'location.riverside_dock.desc',
    exits: [
      {
        targetLocationId: 'city_streets',
        label: 'location.city_streets.name',
        timeCostMinutes: 20,
      },
      {
        targetLocationId: 'black_market',
        label: 'location.black_market.name',
        timeCostMinutes: 18,
      },
    ],
    localActions: [
      { labelKey: 'action.scavenge', nextActionType: 'SCAVENGE_DOCK', timeCostMinutes: 40 },
    ],
  },

  black_market: {
    id: 'black_market',
    nameKey: 'location.black_market.name',
    descriptionKey: 'location.black_market.desc',
    exits: [
      {
        targetLocationId: 'abandoned_station',
        label: 'location.abandoned_station.name',
        timeCostMinutes: 12,
      },
      {
        targetLocationId: 'riverside_dock',
        label: 'location.riverside_dock.name',
        timeCostMinutes: 18,
      },
    ],
    localActions: [
      { labelKey: 'action.trade', nextActionType: 'TRADE_BLACKMARKET', timeCostMinutes: 30 },
      { labelKey: 'action.scavenge', nextActionType: 'SCAVENGE_MARKET', timeCostMinutes: 20 },
    ],
  },
};
