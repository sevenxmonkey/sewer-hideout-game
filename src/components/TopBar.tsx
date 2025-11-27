import React from 'react';
import { useGame } from '../store/GameContext';
import { useLocalization } from '../store/LocalizationContext';

export const StatusBar: React.FC = () => {
  const { state } = useGame();
  const { t } = useLocalization();
  const { player, runtime } = state;

  const hh = Math.floor(runtime.gameTime / 60);
  const mm = runtime.gameTime % 60;

  return (
    <div className="top-bar">
      <div>
        {t('ui.day')}: {runtime.dayNumber}
      </div>
      <div>
        {t('ui.time')}: {String(hh).padStart(2, '0')}:{String(mm).padStart(2, '0')}
      </div>
      <div>
        {t('ui.health')}: {Math.round(player.health)} | {t('ui.satiety')}:{' '}
        {Math.round(player.satiety)} | {t('ui.sanity')}: {Math.round(player.sanity)}
      </div>
    </div>
  );
};
