import React, { useState } from 'react';
import styled from 'styled-components';
import KnobBase from '../knobs/KnobBase';
import { useLfoEnvelope, updateLfoEnvelope } from '../../stores/patchStore';
import type { LfoEnvLoopMode } from '../../types/modulation';
import { EnvelopeVisualizer, type EnvelopeDataADSR, type EnvelopeDataSAR } from './EnvelopeVisualizer';
import { useThemeStore } from '../../theme/themeStore';

const EnvContainer = styled.div`
  background: ${props => props.theme.colors.panel};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const EnvTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  margin: 0 0 15px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const EnvTabs = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const EnvTab = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? props.theme.colors.buttonActive : props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  color: ${props => props.$active ? props.theme.colors.background : props.theme.colors.textMuted};
  padding: 6px 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.theme.colors.buttonHover};
    color: ${props => props.theme.colors.primary};
  }
`;

const EnvControls = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  align-items: start;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const ControlLabel = styled.label`
  color: ${props => props.theme.colors.textMuted};
  font-size: 0.75rem;
  text-transform: uppercase;
`;

const Select = styled.select`
  background: ${props => props.theme.colors.button};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  color: ${props => props.theme.colors.text};
  padding: 8px;
  font-size: 0.875rem;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

/**
 * Composant LfoEnvEditor
 * Gère les 2 enveloppes libres (Env1 et Env2) du PreenFM3
 * Ces enveloppes peuvent moduler les LFOs et autres paramètres
 */
export const LfoEnvEditor: React.FC = () => {
  const [activeEnv, setActiveEnv] = useState<0 | 1>(0);
  const env = useLfoEnvelope(activeEnv);
  const { theme } = useThemeStore();

  const loopModes: LfoEnvLoopMode[] = [
    'Off',
    'Silence',  // Loop all: silence + attack + release
    'Attack',   // Loop from end of silence: attack + release only
  ];

  // Convert AdsrState to EnvelopeData format based on envelope type
  const toEnvelopeData = (): EnvelopeDataADSR | EnvelopeDataSAR => {
    if (activeEnv === 0) {
      // Env1: ADSR structure
      return {
        attack: {
          time: env.adsr.attack.time,
          level: env.adsr.attack.level / 100,
        },
        decay: {
          time: env.adsr.decay.time,
          level: env.adsr.decay.level / 100,
        },
        sustain: {
          time: env.adsr.sustain.time,
          level: env.adsr.sustain.level / 100,
        },
        release: {
          time: env.adsr.release.time,
          level: env.adsr.release.level / 100,
        },
      } as EnvelopeDataADSR;
    } else {
      // Env2: Silence-Attack-Release structure
      return {
        silence: {
          time: env.silence,  // silence field stores the silence time
          level: 0,
        },
        attack: {
          time: env.adsr.attack.time,
          level: 1,  // Attack level is always 1 for Env2
        },
        release: {
          time: env.adsr.decay.time,  // Using decay field to store release time
          level: 0,
        },
      } as EnvelopeDataSAR;
    }
  };

  // Handle envelope changes from visualizer
  const handleEnvelopeChange = (envelopeData: EnvelopeDataADSR | EnvelopeDataSAR) => {
    if (activeEnv === 0) {
      // Env1: ADSR structure
      const env1Data = envelopeData as EnvelopeDataADSR;
      updateLfoEnvelope(activeEnv, {
        adsr: {
          attack: {
            time: env1Data.attack.time,
            level: env1Data.attack.level * 100,
          },
          decay: {
            time: env1Data.decay.time,
            level: env1Data.decay.level * 100,
          },
          sustain: {
            time: env1Data.sustain.time,
            level: env1Data.decay.level * 100, // Sustain level follows decay level
          },
          release: {
            time: env1Data.release.time,
            level: env1Data.release.level * 100,
          },
        },
      });
    } else {
      // Env2: Silence-Attack-Release structure
      const env2Data = envelopeData as EnvelopeDataSAR;
      updateLfoEnvelope(activeEnv, {
        silence: env2Data.silence.time,
        adsr: {
          attack: {
            time: env2Data.attack.time,
            level: 100,  // Attack level always 100 for Env2
          },
          decay: {
            time: env2Data.release.time,  // Using decay field to store release time
            level: 0,
          },
          // Sustain and release not used in Env2
          sustain: { time: 0, level: 0 },
          release: { time: 0, level: 0 },
        },
      });
    }
  };

  return (
    <EnvContainer>
      <EnvTitle>LFO Envelope Editor</EnvTitle>
      
      <EnvTabs>
        {([0, 1] as const).map((envNum) => (
          <EnvTab
            key={envNum}
            $active={activeEnv === envNum}
            onClick={() => setActiveEnv(envNum)}
          >
            Env {envNum + 1}
          </EnvTab>
        ))}
      </EnvTabs>

      <EnvelopeVisualizer 
        envelope={toEnvelopeData()} 
        onChange={handleEnvelopeChange}
        type={activeEnv === 0 ? 'env1' : 'env2'}
      />

      <EnvControls>
        {activeEnv === 0 ? (
          // Env1: ADSR controls
          <>
            <ControlGroup>
              <KnobBase
                size={60}
                min={0}
                max={16}
                step={0.01}
                value={env.adsr.attack.time}
                onChange={(time) => updateLfoEnvelope(activeEnv, { 
                  adsr: { ...env.adsr, attack: { ...env.adsr.attack, time } } 
                })}
                color="#F56565"
                backgroundColor={theme.colors.knobBackground}
                strokeColor={theme.colors.knobStroke}
                renderLabel={(v) => v.toFixed(2)}
                label="Attack"
                labelPosition="left"
              />
            </ControlGroup>

            <ControlGroup>
              <KnobBase
                size={60}
                min={0}
                max={100}
                step={1}
                value={env.adsr.attack.level}
                onChange={(level) => updateLfoEnvelope(activeEnv, { 
                  adsr: { ...env.adsr, attack: { ...env.adsr.attack, level } } 
                })}
                color="#F6AD55"
                backgroundColor={theme.colors.knobBackground}
                strokeColor={theme.colors.knobStroke}
                renderLabel={(v) => Math.round(v)}
                label="Atk Level"
                labelPosition="left"
              />
            </ControlGroup>

            <ControlGroup>
              <KnobBase
                size={60}
                min={0}
                max={16}
                step={0.01}
                value={env.adsr.decay.time}
                onChange={(time) => updateLfoEnvelope(activeEnv, { 
                  adsr: { ...env.adsr, decay: { ...env.adsr.decay, time } } 
                })}
                color="#48BB78"
                backgroundColor={theme.colors.knobBackground}
                strokeColor={theme.colors.knobStroke}
                renderLabel={(v) => v.toFixed(2)}
                label="Decay"
                labelPosition="left"
              />
            </ControlGroup>

            <ControlGroup>
              <KnobBase
                size={60}
                min={0}
                max={100}
                step={1}
                value={env.adsr.decay.level}
                onChange={(level) => updateLfoEnvelope(activeEnv, { 
                  adsr: { 
                    ...env.adsr, 
                    decay: { ...env.adsr.decay, level },
                    sustain: { ...env.adsr.sustain, level } // Sustain level follows decay level
                  } 
                })}
                color="#4299E1"
                backgroundColor={theme.colors.knobBackground}
                strokeColor={theme.colors.knobStroke}
                renderLabel={(v) => Math.round(v)}
                label="Dec Level"
                labelPosition="left"
              />
            </ControlGroup>

            <ControlGroup>
              <KnobBase
                size={60}
                min={0}
                max={16}
                step={0.01}
                value={env.adsr.sustain.time}
                onChange={(time) => updateLfoEnvelope(activeEnv, { 
                  adsr: { ...env.adsr, sustain: { ...env.adsr.sustain, time } } 
                })}
                color="#9F7AEA"
                backgroundColor={theme.colors.knobBackground}
                strokeColor={theme.colors.knobStroke}
                renderLabel={(v) => v.toFixed(2)}
                label="Sustain"
                labelPosition="left"
              />
            </ControlGroup>

            {/* Note: Sustain level automatically follows Decay level */}

            <ControlGroup>
              <KnobBase
                size={60}
                min={0}
                max={16}
                step={0.01}
                value={env.adsr.release.time}
                onChange={(time) => updateLfoEnvelope(activeEnv, { 
                  adsr: { ...env.adsr, release: { ...env.adsr.release, time } } 
                })}
                color="#63B3ED"
                backgroundColor={theme.colors.knobBackground}
                strokeColor={theme.colors.knobStroke}
                renderLabel={(v) => v.toFixed(2)}
                label="Release"
                labelPosition="left"
              />
            </ControlGroup>
          </>
        ) : (
          // Env2: Silence-Attack-Release controls (only times, levels are fixed)
          <>
            <ControlGroup>
              <KnobBase
                size={60}
                min={0}
                max={16}
                step={0.01}
                value={env.silence}
                onChange={(silence) => updateLfoEnvelope(activeEnv, { silence })}
                color="#9CA3AF"
                backgroundColor={theme.colors.knobBackground}
                strokeColor={theme.colors.knobStroke}
                renderLabel={(v) => v.toFixed(2)}
                label="Silence"
                labelPosition="left"
              />
            </ControlGroup>

            <ControlGroup>
              <KnobBase
                size={60}
                min={0}
                max={16}
                step={0.01}
                value={env.adsr.attack.time}
                onChange={(time) => updateLfoEnvelope(activeEnv, { 
                  adsr: { ...env.adsr, attack: { time, level: 100 } }  // Level fixed at 100
                })}
                color="#F56565"
                backgroundColor={theme.colors.knobBackground}
                strokeColor={theme.colors.knobStroke}
                renderLabel={(v) => v.toFixed(2)}
                label="Attack"
                labelPosition="left"
              />
            </ControlGroup>

            <ControlGroup>
              <KnobBase
                size={60}
                min={0}
                max={16}
                step={0.01}
                value={env.adsr.decay.time}
                onChange={(time) => updateLfoEnvelope(activeEnv, { 
                  adsr: { ...env.adsr, decay: { time, level: 0 } }  // Level fixed at 0
                })}
                color="#63B3ED"
                backgroundColor={theme.colors.knobBackground}
                strokeColor={theme.colors.knobStroke}
                renderLabel={(v) => v.toFixed(2)}
                label="Release"
                labelPosition="left"
              />
            </ControlGroup>
          </>
        )}

        {/* Loop Mode only for Env2 */}
        {activeEnv === 1 && (
          <ControlGroup>
            <ControlLabel>Loop Mode</ControlLabel>
            <Select 
              value={env.loopMode}
              onChange={(e) => updateLfoEnvelope(activeEnv, { loopMode: e.target.value as LfoEnvLoopMode })}
            >
              {loopModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </Select>
          </ControlGroup>
        )}
      </EnvControls>
    </EnvContainer>
  );
};
