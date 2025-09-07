declare module 'rc-knob' {
    import { ComponentType } from 'react';

    interface KnobProps {
        min?: number;
        max?: number;
        value: number;
        onChange?: (value: number) => void;
        step?: number;
        size?: number;
        thickness?: number;
        fgColor?: string;
        bgColor?: string;
    }

    export const Knob: ComponentType<KnobProps>;
}
