import React from 'react';
import { useGame } from '../store/GameContext';
import { useLocalization } from '../store/LocalizationContext';

export const SceneView: React.FC = () => {
  const { state, performLocalAction } = useGame();
  const { t } = useLocalization();

  const loc = state.map.allLocations[state.player.locationId];

  return (
    <div className="scene-view">
      {/* <div>--------------{t('ui.location')}--------------</div> */}
      <p style={{ color: 'greenyellow', marginBottom: '4px' }}>{t(loc.nameKey)}</p>
      <p>{t(loc.descriptionKey)}</p>
      {/* actions and npc list combined here */}
      <div className="actions-panel">
        {loc.localActions.map((a) => (
          <button key={a.nextActionType} onClick={() => performLocalAction(a)}>
            {t(a.labelKey)} <span className="time-cost">{a.timeCostMinutes}m</span>
          </button>
        ))}
      </div>
      <p>你看到了这些人</p>
      <div>
        {['NPC A', 'NPC B', 'NPC C'].map((n) => (
          <button key={n}>{n}</button>
        ))}
      </div>
    </div>
  );
};
