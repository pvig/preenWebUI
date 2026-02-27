// types/waveform.ts

// 1️⃣ Définition du type WaveformType
// Correspond exactement aux 14 types du firmware PreenFM3 (oscShapeNames)
export type WaveformType =
    | 'SINE'        // sin  - id 0
    | 'SAW'         // saw  - id 1
    | 'SQUARE'      // squa - id 2
    | 'SIN_SQUARED' // s^2  - id 3
    | 'SIN_ZERO'    // szer - id 4
    | 'SIN_POS'     // spos - id 5
    | 'RAND'        // rand - id 6
    | 'OFF'         // off  - id 7
    | 'USER1'       // Usr1 - id 8
    | 'USER2'       // Usr2 - id 9
    | 'USER3'       // Usr3 - id 10
    | 'USER4'       // Usr4 - id 11
    | 'USER5'       // Usr5 - id 12
    | 'USER6';      // Usr6 - id 13

// 2️⃣ Interface pour les items de la liste
export interface WaveformItem {
    id: number;
    name: WaveformType;
}

// 3️⃣ Liste constante des waveforms avec id
// Ordre d'affichage selon oscShapeNamesOrder[] du firmware (FMDisplayEditor.cpp)
// OFF est affiché en premier dans l'interface utilisateur
export const WAVEFORMS: WaveformItem[] = [
    { id: 7, name: 'OFF' },         // Position 0
    { id: 0, name: 'SINE' },        // Position 1
    { id: 1, name: 'SAW' },         // Position 2
    { id: 2, name: 'SQUARE' },      // Position 3
    { id: 3, name: 'SIN_SQUARED' }, // Position 4
    { id: 4, name: 'SIN_ZERO' },    // Position 5
    { id: 5, name: 'SIN_POS' },     // Position 6
    { id: 6, name: 'RAND' },        // Position 7
    { id: 8, name: 'USER1' },       // Position 8
    { id: 9, name: 'USER2' },       // Position 9
    { id: 10, name: 'USER3' },      // Position 10
    { id: 11, name: 'USER4' },      // Position 11
    { id: 12, name: 'USER5' },      // Position 12
    { id: 13, name: 'USER6' },      // Position 13
];

// 4️⃣ Helper pour obtenir l'ID MIDI d'une waveform
export function getWaveformId(waveform: WaveformType): number {
    const item = WAVEFORMS.find(w => w.name === waveform);
    return item?.id ?? 0; // Par défaut SINE (id 0)
}
