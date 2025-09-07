// src/types/react-envelope-graph.d.ts
declare module 'react-envelope-graph' {
    import * as React from 'react';

    export interface EnvelopeGraphProps {
        defaultXa?: number;
        defaultXd?: number;
        defaultYs?: number;
        defaultXr?: number;
        ratio?: { xa?: number; xd?: number; xr?: number };
        style?: React.CSSProperties;
        styles?: {
            line?: React.CSSProperties;
            dndBox?: React.CSSProperties;
            dndBoxActive?: React.CSSProperties;
        };
        onChange?: (data: { xa: number; xd: number; ys: number; xr: number }) => void;
    }

    const EnvelopeGraph: React.FC<EnvelopeGraphProps>;
    export default EnvelopeGraph;
}
