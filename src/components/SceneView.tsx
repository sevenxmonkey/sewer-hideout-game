import React from 'react';
import { useGame } from '../store/GameContext';
import { useLocalization } from '../store/LocalizationContext';

export const SceneView: React.FC = () => {
  const { state, moveTo } = useGame();
  const { t } = useLocalization();

  const loc = state.map.allLocations[state.player.locationId];

  return (
    <div>
      <div>{t(loc.nameKey)}</div>
      <div>{t(loc.descriptionKey)}</div>
      <div>--------------{t('ui.move')}--------------</div>
      <div>
        {loc.exits.map((e) => (
          <button key={e.targetLocationId} onClick={() => moveTo(e.targetLocationId)}>
            {t(e.label)} ({e.timeCostMinutes}m)
          </button>
        ))}
      </div>

      <div>--------------{t('ui.actions')}--------------</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {loc.localActions.map((a) => (
          <button key={a.nextActionType}>
            {t(a.labelKey)} ({a.timeCostMinutes}m)
          </button>
        ))}
      </div>
    </div>
  );
};
