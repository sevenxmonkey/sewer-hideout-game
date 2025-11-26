import type { ILocation } from '../core/interfaces/IMapState';

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
    ],
    localActions: [
      { labelKey: 'action.scavenge', nextActionType: 'SCAVENGE', timeCostMinutes: 30 },
    ],
  },
};
