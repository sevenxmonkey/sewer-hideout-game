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
    <div>
      <div>
        {t('ui.day')}: {runtime.dayNumber}{' '}
      </div>
      <div>
        {t('ui.time')}: {String(hh).padStart(2, '0')}:{String(mm).padStart(2, '0')}
      </div>
      <div>
        HP: {player.health} | Hunger: {player.hunger} | Sanity: {player.sanity}
      </div>
    </div>
  );
};
