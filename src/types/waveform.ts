// types/waveform.ts

// 1️⃣ Définition du type WaveformType
export type WaveformType =
    | 'SINE'
    | 'SAW'
    | 'SQUARE'
    | 'TRIANGLE'
    | 'NOISE'
    | 'USER1'
    | 'USER2'
    | 'USER3'
    | 'USER4'
    | 'USER5'
    | 'USER6';

// 2️⃣ Interface pour les items de la liste
export interface WaveformItem {
    id: number;
    name: WaveformType;
}

// 3️⃣ Liste constante des waveforms avec id
export const WAVEFORMS: WaveformItem[] = [
    { id: 0, name: 'SINE' },
    { id: 1, name: 'SAW' },
    { id: 2, name: 'SQUARE' },
    { id: 3, name: 'TRIANGLE' },
    { id: 4, name: 'NOISE' },
    { id: 5, name: 'USER1' },
    { id: 6, name: 'USER2' },
    { id: 7, name: 'USER3' },
    { id: 8, name: 'USER4' },
    { id: 9, name: 'USER5' },
    { id: 10, name: 'USER6' },
];
