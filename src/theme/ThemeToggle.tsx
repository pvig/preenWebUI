import styled from 'styled-components';
import { useThemeStore } from './themeStore';

const ToggleButton = styled.button`
  background: ${props => props.theme.colors.button};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.colors.text};
  font-size: 0.9rem;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.theme.colors.buttonHover};
    border-color: ${props => props.theme.colors.borderHover};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useThemeStore();
  
  return (
    <ToggleButton onClick={toggleTheme} title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}>
      {isDark ? <SunIcon /> : <MoonIcon />}
    </ToggleButton>
  );
};
