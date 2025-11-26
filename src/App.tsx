import React, { useEffect } from 'react';
import './App.scss';
import { LocalizationProvider } from './store/LocalizationContext';
import { GameProvider } from './store/GameContext';
import { StatusBar } from './components/StatusBar';
import { SceneView } from './components/SceneView';
import SceneHeader from './components/SceneHeader';
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
          {/* <SceneHeader /> */}
          <StatusBar />
          <SceneView />
        </div>
      </GameProvider>
    </LocalizationProvider>
  );
};

export default App;
