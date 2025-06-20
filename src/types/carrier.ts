// types/carrier.ts
export interface CarrierSettings {
    volume: number;  // 0-127
    pan: number;     // -64 à +63
    enabled: boolean;
  }
  
  export interface CarrierState {
    [opId: number]: CarrierSettings;
  }
  
  // Valeurs par défaut pour un carrier
  export const DEFAULT_CARRIER_SETTINGS: CarrierSettings = {
    volume: 100,
    pan: 0,
    enabled: true
  };