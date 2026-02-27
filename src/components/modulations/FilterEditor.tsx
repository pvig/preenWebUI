import React from 'react';
import styled from 'styled-components';
import KnobBase from '../knobs/KnobBase';
import { useFilter, updateFilter } from '../../stores/patchStore';
import type { Filter1Type, Filter2Type } from '../../types/patch';
import { useThemeStore } from '../../theme/themeStore';

const FilterContainer = styled.div`
  background: ${props => props.theme.colors.panel};
  border-radius: 8px;
  padding: 16px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const FilterTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const FilterControls = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
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
  padding: 8px 12px;
  font-size: 0.875rem;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

interface FilterEditorProps {
  filterIndex: 0 | 1;
}

/**
 * Composant FilterEditor
 * Gère un des 2 filtres du PreenFM3
 * Chaque filtre a : type, param1 (frequency), param2 (resonance), gain/mix
 */
export const FilterEditor: React.FC<FilterEditorProps> = ({ filterIndex }) => {
  const filter = useFilter(filterIndex);
  const { theme } = useThemeStore();

  // Filter 1 types
  const filter1Types: Filter1Type[] = [
    'OFF', 'MIXER', 'LP', 'HP', 'BASS', 'BP', 'CRUSHER',
    'LP2', 'HP2', 'BP2', 'LP3', 'HP3', 'BP3',
    'PEAK', 'NOTCH', 'BELL', 'LOWSHELF', 'HIGHSHELF',
    'LPHP', 'BPds', 'LPWS', 'TILT', 'STEREO',
    'SAT', 'SIGMOID', 'FOLD', 'WRAP', 'XOR',
    'TEXTURE1', 'TEXTURE2', 'LPXOR', 'LPXOR2',
    'LPSIN', 'HPSIN', 'QUADNOTCH',
    'AP4', 'AP4B', 'AP4D',
    'ORYX', 'ORYX2', 'ORYX3',
    '18DB', 'LADDER', 'LADDER2', 'DIOD',
    'KRMG', 'TEEBEE', 'SVFLH', 'CRUSH2'
  ];

  // Filter 2 types
  const filter2Types: Filter2Type[] = [
    'OFF', 'FLANGE', 'DIMENSION', 'CHORUS', 'WIDE',
    'DOUBLER', 'TRIPLER', 'BODE', 'DELAYCRUNCH',
    'PINGPONG', 'DIFFUSER', 'GRAIN1', 'GRAIN2',
    'STEREO_BP', 'PLUCK', 'PLUCK2', 'RESONATORS'
  ];

  const filterTypes = filterIndex === 0 ? filter1Types : filter2Types;

  const thirdParamLabel = filterIndex === 0 ? 'Gain' : 'Mix';

  return (
    <FilterContainer>
      <FilterHeader>
        <FilterTitle>Filter {filterIndex + 1}</FilterTitle>
      </FilterHeader>

      <FilterControls>
        {/* Type de filtre */}
        <ControlGroup>
          <ControlLabel>Type</ControlLabel>
          <Select 
            value={filter.type}
            onChange={(e) => updateFilter(filterIndex, { type: e.target.value as (Filter1Type | Filter2Type) })}
          >
            {filterTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </ControlGroup>

        {/* Param1 - Frequency/Cutoff */}
        <ControlGroup>
          <KnobBase
            size={60}
            min={0}
            max={255}
            step={1}
            value={filter.param1}
            onChange={(param1) => updateFilter(filterIndex, { param1 })}
            color="#F56565"
            backgroundColor={theme.colors.knobBackground}
            strokeColor={theme.colors.knobStroke}
            renderLabel={(v) => Math.round(v)}
            label="Cutoff"
          />
        </ControlGroup>

        {/* Param2 - Resonance */}
        <ControlGroup>
          <KnobBase
            size={60}
            min={0}
            max={255}
            step={1}
            value={filter.param2}
            onChange={(param2) => updateFilter(filterIndex, { param2 })}
            color="#48BB78"
            backgroundColor={theme.colors.knobBackground}
            strokeColor={theme.colors.knobStroke}
            renderLabel={(v) => Math.round(v)}
            label="Resonance"
          />
        </ControlGroup>

        {/* Gain (Filter1) ou Mix (Filter2) */}
        <ControlGroup>
          <KnobBase
            size={60}
            min={0}
            max={255}
            step={1}
            value={filter.gain}
            onChange={(gain) => updateFilter(filterIndex, { gain })}
            color="#4299E1"
            backgroundColor={theme.colors.knobBackground}
            strokeColor={theme.colors.knobStroke}
            renderLabel={(v) => Math.round(v)}
            label={thirdParamLabel}
          />
        </ControlGroup>
      </FilterControls>
    </FilterContainer>
  );
};
