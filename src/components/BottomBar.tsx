import React from 'react';
import { useLocalization } from '../store/LocalizationContext';
import { useGame } from '../store/GameContext';
import type { IExit } from '../interfaces/IMapState';
import { itemDefinitions } from '../data/itemData';

const BottomBar: React.FC = () => {
  const { t } = useLocalization();
  const { state, moveTo, consumeItem } = useGame();
  const currentLocation = state.map.allLocations[state.player.locationId];
  const currentExits: IExit[] = currentLocation?.exits ?? [];

  const inv = state.player.inventory ?? [];

  return (
    <footer className="bottom-bar">
      <div className="bottom-panels two-cols">
        {/* Left: Inventory (takes 1/3) */}
        <div className="panel inventory">
          <div className="panel-label">{t('ui.inventory')}</div>
          <div className="inventory-grid">
            {inv.map((instance, idx) => {
              const def = itemDefinitions[instance.id];
              const name = def ? t(def.nameKey) : instance.id;
              return (
                <div
                  key={`${instance.id}-${idx}`}
                  className="inv-item item"
                  role="button"
                  onClick={() => consumeItem(instance.id)}
                >
                  <div>
                    <div>{name}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>{instance.qty}x</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Navigation (takes 2/3) */}
        <div className="panel nav">
          <div className="panel-label">{t('ui.move_to')}</div>
          <div className="nav-list">
            {currentExits.map((e: IExit) => (
              <div
                key={e.targetLocationId}
                className="nav-item item"
                role="button"
                onClick={() => moveTo(e.targetLocationId)}
              >
                {t(e.label)} <span className="time-cost">{e.timeCostMinutes}m</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BottomBar;
