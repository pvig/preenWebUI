// src/utils/waveformUtils.ts
import { WaveformType } from '../types/waveform';

// ————— Affichage lisible —————
export function waveformToDisplayName(w: WaveformType): string {
    switch (w) {
        case 'SINE': return 'Sinus';
        case 'SAW': return 'Dent de scie';
        case 'SQUARE': return 'Carré';
        case 'TRIANGLE': return 'Triangle';
        case 'NOISE': return 'Bruit';
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

        case 'TRIANGLE': {
            return [
                `M 0 ${midY}`,
                `L ${width * 0.25} ${midY - amp}`,
                `L ${width * 0.5} ${midY + amp}`,
                `L ${width * 0.75} ${midY - amp}`,
                `L ${width * 0.98} ${midY + amp}`,
            ].join(' ');
        }

        case 'NOISE': {
            // bruit « pseudo » déterministe
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
