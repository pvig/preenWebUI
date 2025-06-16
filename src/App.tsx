import { useState } from 'react';
import { PatchEditor } from './screens/PatchEditor';
import { EffectsEditor } from './screens/EffectsEditor';
import { PatchLibrary } from './screens/PatchLibrary';
import { MidiMenu } from './components/MidiMenu';

type AppScreen = 'patch' | 'effects' | 'library';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('patch');

  return (
    <div className="app-container">
      <header>
        <MidiMenu />
      </header>
      <nav className="main-nav">
        <button onClick={() => setCurrentScreen('patch')} className={currentScreen === 'patch' ? 'active' : ''}>
          Patch
        </button>
        <button onClick={() => setCurrentScreen('effects')} className={currentScreen === 'effects' ? 'active' : ''}>
          Effets
        </button>
        <button onClick={() => setCurrentScreen('library')} className={currentScreen === 'library' ? 'active' : ''}>
          Librairie
        </button>
      </nav>

      <main>
        {currentScreen === 'patch' && <PatchEditor />}
        {currentScreen === 'effects' && <EffectsEditor />}
        {currentScreen === 'library' && <PatchLibrary />}
      </main>
    </div>
  );
}