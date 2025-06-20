import React, { createContext, useContext, useState, useCallback } from 'react';
import { type CarrierSettings, type CarrierState } from '../../types/carrier';

interface Modulation {
  value: number; // 0-127
  veloSens: number; // -64 à +63
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

interface FMSynthContextType {
  algorithms: Algorithm[];
  currentAlgorithm: Algorithm;
  setCurrentAlgorithm: (algo: Algorithm) => void;
  imValues: Record<string, Modulation>;
  updateImValue: (imNumber: number, type: 'value' | 'veloSens', val: number) => void;
}

// Définition des algorithmes DX7 de base
const DEFAULT_ALGORITHMS: Algorithm[] = [
  {
    id: 1,
    name: "6OP-A",
    operatorCount: 6,
    ops: [
      { id: 1, type: 'modulator', modulators: [2, 3, 4] },
      { id: 2, type: 'modulator', modulators: [] },
      { id: 3, type: 'modulator', modulators: [] },
      { id: 4, type: 'carrier', modulators: [] },
      { id: 5, type: 'modulator', modulators: [6] },
      { id: 6, type: 'carrier', modulators: [] }
    ]
  },
  {
    id: 2,
    name: "6OP-B",
    operatorCount: 6,
    ops: [
      { id: 1, type: 'modulator', modulators: [2, 4] },
      { id: 2, type: 'modulator', modulators: [] },
      { id: 3, type: 'modulator', modulators: [4] },
      { id: 4, type: 'carrier', modulators: [] },
      { id: 5, type: 'modulator', modulators: [6] },
      { id: 6, type: 'carrier', modulators: [] }
    ]
  },
  {
    id: 3,
    name: "3OP-B",
    operatorCount: 3,
    ops: [
      { id: 1, type: 'carrier', modulators: [2, 3] },
      { id: 2, type: 'modulator', modulators: [] },
      { id: 3, type: 'modulator', modulators: [] }
    ]
  }
];

const FMSynthContext = createContext<FMSynthContextType | undefined>(undefined);

export const FMSynthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [algorithms] = useState<Algorithm[]>(DEFAULT_ALGORITHMS);
  const [currentAlgorithm, setCurrentAlgorithm] = useState<Algorithm>(DEFAULT_ALGORITHMS[0]);
  
  const [imValues, setImValues] = useState<Record<string, Modulation>>({});
  const [carrierSettings, setCarrierSettings] = useState<CarrierState>({});

  // Initialisation des paramètres des carriers
  const initCarrierSettings = useCallback(() => {
    const settings: Record<number, CarrierSettings> = {};
    DEFAULT_ALGORITHMS.forEach(algo => {
      algo.ops.filter(op => op.type === 'carrier').forEach(op => {
        settings[op.id] = { volume: 100, pan: 0, enabled: true };
      });
    });
    return settings;
  }, []);

  // Mise à jour des modulations
  const updateImValue = useCallback((imNumber: number, type: 'value' | 'veloSens', val: number) => {
    setImValues(prev => ({
      ...prev,
      [`IM${imNumber}`]: {
        ...prev[`IM${imNumber}`],
        [type]: val
      }
    }));
  }, []);

  // Initialisation au premier rendu
  React.useEffect(() => {
    setCarrierSettings(initCarrierSettings());
  }, [initCarrierSettings]);

  return (
    <FMSynthContext.Provider value={{
      algorithms,
      currentAlgorithm,
      setCurrentAlgorithm,
      imValues,
      updateImValue
    }}>
      {children}
    </FMSynthContext.Provider>
  );
};

export const useFMSynth = () => {
  const context = useContext(FMSynthContext);
  if (!context) {
    throw new Error('useFMSynth must be used within a FMSynthProvider');
  }
  return context;
};