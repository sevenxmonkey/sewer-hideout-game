import React, { useEffect } from 'react';
import './App.scss';
import { LocalizationProvider } from './store/LocalizationContext';
import { GameProvider } from './store/GameContext';
import { StatusBar } from './components/TopBar';
import { SceneView } from './components/SceneView';
import BottomBar from './components/BottomBar';
import { initVh, initPreventBodyDrag } from './utils';

const App: React.FC = () => {
  useEffect(() => {
    const cleanupVh = initVh();
    const cleanupPrevent = initPreventBodyDrag();
    return () => {
      cleanupVh();
      cleanupPrevent();
    };
  }, []);

  return (
    <LocalizationProvider>
      <GameProvider>
        <div className="App">
          {/* top: fixed-size status bar */}
          <header className="top-bar">
            <StatusBar />
          </header>

          {/* middle: flexible, can overflow and scroll */}
          <main className="scene-container">
            <SceneView />
          </main>

          {/* bottom: fixed-size controls (actions / nav / inventory) */}
          <BottomBar />
        </div>
      </GameProvider>
    </LocalizationProvider>
  );
};

export default App;
