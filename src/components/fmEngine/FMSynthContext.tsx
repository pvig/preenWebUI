// src/components/fmEngine/FMSynthContext.tsx
import React, { createContext, useContext, useMemo } from 'react';
//import { usePatchStore, useSelectedOperatorId, usePatchActions } from '../../stores/patchStore';
import { useStore } from 'zustand';
import { useCurrentPatch } from '../../stores/patchStore';
import { Patch } from "../../types/patch";
//import { type Algorithm, type Envelope, type Patch } from '../../types/patch';
interface FMSynthContextType {
  patch: Patch;
  getOperator: (id: number) => Patch["operators"][number] | undefined;
  updateOperator: (id: number, changes: Partial<Patch["operators"][number]>) => void;
}

const FMSynthContext = createContext<FMSynthContextType | null>(null);

export const FMSynthProvider = ({ patch, children }: { patch: Patch, children: React.ReactNode }) => {
  //const store = useCurrentPatch();
  
  const value = useMemo<FMSynthContextType>(
    () => ({
      patch,
      getOperator: (id) => patch.operators.find((op) => op.id === id),
      updateOperator: (id, changes) => {
        // ⚠️ Ici : soit tu relies directement à usePatchStore.updateOscillator/updateOperator
        //console.log("Update operator", id, changes);
      },
    }),
    [patch]
  );
  return (
    <FMSynthContext.Provider value={value}>{children}</FMSynthContext.Provider>
  );
}