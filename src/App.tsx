import React from 'react';
import './App.scss';
import { LocalizationProvider } from './store/LocalizationContext';
import { GameProvider } from './store/GameContext';
import { StatusBar } from './components/StatusBar';
import { SceneView } from './components/SceneView';
import SceneHeader from './components/SceneHeader';

const App: React.FC = () => {
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
