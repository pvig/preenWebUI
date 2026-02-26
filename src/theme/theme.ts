/**
 * Thèmes clair et sombre pour l'application
 */

export interface Theme {
  name: 'light' | 'dark';
  colors: {
    // Arrière-plans
    background: string;
    backgroundSecondary: string;
    panel: string;
    panelHover: string;
    
    // Textes
    text: string;
    textSecondary: string;
    textMuted: string;
    
    // Bordures
    border: string;
    borderHover: string;
    
    // Accents / Primaires
    primary: string;
    primaryHover: string;
    accent: string;
    
    // Boutons
    button: string;
    buttonHover: string;
    buttonActive: string;
    
    // Navigation
    nav: string;
    navActive: string;
    
    // Knobs et contrôles
    knobBackground: string;
    knobStroke: string;
    
    // Highlights
    highlight: string;
    highlightGlow: string;
    
    // ADSR colors
    adsrAttack: string;
    adsrDecay: string;
    adsrSustain: string;
    adsrRelease: string;
  };
}

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: '#1a202c',
    backgroundSecondary: '#1a1a1a',
    panel: '#2d3748',
    panelHover: '#374151',
    
    text: '#e2e8f0',
    textSecondary: '#cbd5e0',
    textMuted: '#a0aec0',
    
    border: '#4a5568',
    borderHover: '#63b3ed',
    
    primary: '#63b3ed',
    primaryHover: '#4299e1',
    accent: '#9F7AEA',
    
    button: '#4a5568',
    buttonHover: '#718096',
    buttonActive: '#63b3ed',
    
    nav: '#2d3748',
    navActive: '#4a5568',
    
    knobBackground: '#2d3748',
    knobStroke: '#4a5568',
    
    highlight: '#fbbf24',
    highlightGlow: 'rgba(251, 191, 36, 0.5)',
    
    adsrAttack: '#FF6B6B',
    adsrDecay: '#48BB78',
    adsrSustain: '#4299E1',
    adsrRelease: '#F6AD55',
  },
};

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: '#f7fafc',
    backgroundSecondary: '#ffffff',
    panel: '#ffffff',
    panelHover: '#f7fafc',
    
    text: '#1a202c',
    textSecondary: '#2d3748',
    textMuted: '#718096',
    
    border: '#e2e8f0',
    borderHover: '#3182ce',
    
    primary: '#3182ce',
    primaryHover: '#2c5282',
    accent: '#805ad5',
    
    button: '#e2e8f0',
    buttonHover: '#cbd5e0',
    buttonActive: '#3182ce',
    
    nav: '#e2e8f0',
    navActive: '#ffffff',
    
    knobBackground: '#ffffff',
    knobStroke: '#e2e8f0',
    
    highlight: '#d69e2e',
    highlightGlow: 'rgba(214, 158, 46, 0.5)',
    
    adsrAttack: '#e53e3e',
    adsrDecay: '#38a169',
    adsrSustain: '#3182ce',
    adsrRelease: '#dd6b20',
  },
};
