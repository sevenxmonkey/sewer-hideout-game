import React from 'react';
import { useGame } from '../store/GameContext';
import { useLocalization } from '../store/LocalizationContext';
import { getNpcPresencesAt } from '../data/npcs';

export const SceneView: React.FC = () => {
  const { state, performLocalAction } = useGame();
  const { t } = useLocalization();

  const loc = state.map.allLocations[state.player.locationId];
  const npcPresences = getNpcPresencesAt(state.player.locationId, state.runtime.gameTime);

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
      <p>{t('ui.npcs')}</p>
      <div>
        {npcPresences.length === 0 ? (
          <span style={{ opacity: 0.7 }}>{t('npc.none')}</span>
        ) : (
          npcPresences.map(({ npc, slot }) => (
            <button key={npc.id} onClick={() => console.log(t(slot.interactionKey))}>
              {t(npc.nameKey)}
            </button>
          ))
        )}
      </div>
    </div>
  );
};
