import React, { createContext, useContext, useState, useCallback } from 'react';

// Définition des types
interface Modulation {
  value: number;
  veloSens: number;
}

interface Operator {
  id: number;
  type: 'carrier' | 'modulator';
  modulators: number[];
}

interface Algorithm {
  id: number;
  name: string;
  operatorCount: number;
  ops: Operator[];
}

// Type du contexte
interface FMSynthContextType {
  algorithms: Algorithm[];
  currentAlgorithm: Algorithm;
  setCurrentAlgorithm: (algo: Algorithm) => void;
  imValues: Record<string, Modulation>;
  updateImValue: (imNumber: number, type: 'value' | 'veloSens', val: number) => void;
}

// Création du contexte avec valeur par défaut explicite
export const FMSynthContext = createContext<FMSynthContextType>({
  algorithms: [],
  currentAlgorithm: {
    id: 0,
    name: '',
    operatorCount: 0,
    ops: []
  },
  setCurrentAlgorithm: () => {},
  imValues: {},
  updateImValue: () => {}
});

// Implémentation du Provider
export const FMSynthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [algorithms] = useState<Algorithm[]>([
    // Initialisez vos algorithmes ici
    {
      id: 1,
      name: '6OP-A',
      operatorCount: 6,
      ops: [
        { id: 1, type: 'modulator', modulators: [2, 3, 4] },
        { id: 2, type: 'carrier', modulators: [1] },
        { id: 3, type: 'carrier', modulators: [1] },
        { id: 4, type: 'carrier', modulators: [1] },
        // ... autres opérateurs
      ]
    }
  ]);

  const [currentAlgorithm, setCurrentAlgorithm] = useState<Algorithm>(algorithms[0]);
  const [imValues, setImValues] = useState<Record<string, Modulation>>({});

  const updateImValue = useCallback((imNumber: number, type: 'value' | 'veloSens', val: number) => {
    setImValues(prev => ({
      ...prev,
      [`IM${imNumber}`]: {
        ...prev[`IM${imNumber}`],
        [type]: val
      }
    }));
  }, []);

  // Valeur du contexte avec toutes les propriétés requises
  const contextValue: FMSynthContextType = {
    algorithms,
    currentAlgorithm,
    setCurrentAlgorithm,
    imValues,
    updateImValue
  };

  return (
    <FMSynthContext.Provider value={contextValue}>
      {children}
    </FMSynthContext.Provider>
  );
};

// Hook personnalisé
export const useFMSynth = () => {
  const context = useContext(FMSynthContext);
  if (!context) {
    throw new Error('useFMSynth must be used within a FMSynthProvider');
  }
  return context;
};