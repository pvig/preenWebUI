// src/utils/waveformUtils.ts
import { WaveformType } from '../types/waveform';

// ————— Affichage lisible —————
export function waveformToDisplayName(w: WaveformType): string {
    switch (w) {
        case 'SINE': return 'Sinus';
        case 'SAW': return 'Dent de scie';
        case 'SQUARE': return 'Carré';
        case 'SIN_SQUARED': return 'Sin²';
        case 'SIN_ZERO': return 'Sin Zero';
        case 'SIN_POS': return 'Sin+';
        case 'RAND': return 'Aléatoire';
        case 'OFF': return 'Off';
        default:
            // USER1..USER6 → "User 1"…
            return w.replace('USER', 'User ');
    }
}

// ————— Génération de path pour une vignette —————
export function generateWaveformPath(
    waveform: WaveformType,
    width = 40,
    height = 20
): string {
    const midY = height / 2;
    const amp = (height * 0.45);

    switch (waveform) {
        case 'SINE': {
            const n = 32;
            let d = '';
            for (let i = 0; i <= n; i++) {
                const t = i / n;
                const x = t * width;
                const y = midY - amp * Math.sin(2 * Math.PI * t);
                d += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
            }
            return d;
        }

        case 'SQUARE': {
            const top = midY - amp;
            const bot = midY + amp;
            return [
                `M 0 ${top}`,
                `L ${width * 0.49} ${top}`,
                `L ${width * 0.49} ${bot}`,
                `L ${width * 0.98} ${bot}`,
            ].join(' ');
        }

        case 'SAW': {
            // montée diagonale puis reset
            return `M 0 ${midY + amp} L ${width * 0.98} ${midY - amp}`;
        }

        case 'SIN_SQUARED': {
            // s^2: sinus au carré (toujours positif ou négatif)
            const n = 32;
            let d = '';
            for (let i = 0; i <= n; i++) {
                const t = i / n;
                const x = t * width;
                const sinVal = Math.sin(2 * Math.PI * t);
                const y = midY - amp * Math.sign(sinVal) * (sinVal * sinVal);
                d += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
            }
            return d;
        }

        case 'SIN_ZERO': {
            // szer: sinus avec portions à zéro
            const n = 32;
            let d = '';
            for (let i = 0; i <= n; i++) {
                const t = i / n;
                const x = t * width;
                const sinVal = Math.sin(2 * Math.PI * t);
                const y = (Math.abs(sinVal) > 0.5) ? midY - amp * sinVal : midY;
                d += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
            }
            return d;
        }

        case 'SIN_POS': {
            // spos: sinus redressé (seulement positif)
            const n = 32;
            let d = '';
            for (let i = 0; i <= n; i++) {
                const t = i / n;
                const x = t * width;
                const sinVal = Math.abs(Math.sin(2 * Math.PI * t));
                const y = midY - amp * sinVal;
                d += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
            }
            return d;
        }

        case 'RAND': {
            // rand: bruit aléatoire
            const n = 40;
            let seed = 1337;
            const rnd = () => {
                // mulberry32
                seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
                let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
                t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
                return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
            };
            let d = '';
            for (let i = 0; i <= n; i++) {
                const t = i / n;
                const x = t * width;
                const y = midY + (rnd() * 2 - 1) * amp;
                d += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
            }
            return d;
        }

        case 'OFF': {
            // off: ligne plate au milieu (silence)
            return `M 0 ${midY} L ${width} ${midY}`;
        }

        // USER1..USER6 : on réutilise un sinus simple
        default: {
            const n = 24;
            let d = '';
            for (let i = 0; i <= n; i++) {
                const t = i / n;
                const x = t * width;
                const y = midY - amp * Math.sin(2 * Math.PI * t);
                d += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
            }
            return d;
        }
    }
}
