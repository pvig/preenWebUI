import { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { PatchEditor } from './screens/PatchEditor';
import { ModulationsEditor } from './screens/modulationsEditor';
import { EffectsEditor } from './screens/EffectsEditor';
import { PatchLibrary } from './screens/PatchLibrary';
import { MidiMenu } from './components/MidiMenu';
import { ThemeToggle } from './theme/ThemeToggle';
import { useThemeStore } from './theme/themeStore';
import { GlobalStyles } from './theme/GlobalStyles';

type AppScreen = 'patch' | 'matrix'| 'effects'  | 'library';

const AppContainer = styled.div`
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  min-height: 100vh;
  transition: background-color 0.3s, color 0.3s;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: ${props => props.theme.colors.backgroundSecondary};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const Nav = styled.nav`
  background-color: ${props => props.theme.colors.nav};
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  button {
    background-color: ${props => props.theme.colors.button};
    color: ${props => props.theme.colors.text};
    border: 1px solid ${props => props.theme.colors.border};
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    transition: all 0.2s;
    
    &:hover {
      background-color: ${props => props.theme.colors.buttonHover};
      border-color: ${props => props.theme.colors.borderHover};
    }
    
    &.active {
      background-color: ${props => props.theme.colors.navActive};
      color: ${props => props.theme.colors.text};
      border-bottom: 1px solid ${props => props.theme.colors.navActive};
    }
  }
`;

const Main = styled.main`
  padding: 0.5rem 0 0 0;
`;

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('patch');
  const { theme } = useThemeStore();

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AppContainer>
        <Header>
          <MidiMenu />
          <ThemeToggle />
        </Header>
        
        <Nav>
          <button onClick={() => setCurrentScreen('patch')} className={currentScreen === 'patch' ? 'active' : ''}>
            Patch
          </button>
          <button onClick={() => setCurrentScreen('matrix')} className={currentScreen === 'matrix' ? 'active' : ''}>
            Modulations
          </button>
          <button onClick={() => setCurrentScreen('effects')} className={currentScreen === 'effects' ? 'active' : ''}>
            Effets
          </button>
          <button onClick={() => setCurrentScreen('library')} className={currentScreen === 'library' ? 'active' : ''}>
            Librairie
          </button>
        </Nav>

        <Main>
          {currentScreen === 'patch' && <PatchEditor />}
          {currentScreen === 'matrix' && <ModulationsEditor />}
          {currentScreen === 'effects' && <EffectsEditor />}
          {currentScreen === 'library' && <PatchLibrary />}
        </Main>
      </AppContainer>
    </ThemeProvider>
  );
}