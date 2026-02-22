import React from 'react';
import styled from 'styled-components';
import { Algorithm } from '../../types/patch';
import { useCurrentPatch, updateModulationAmount, updateModulationVelo } from '../../stores/patchStore';
import { useFMSynthContext } from './FMSynthContext';
import { ALGO_DIAGRAMS } from '../../algo/algorithms.static';
import KnobBase from '../knobs/KnobBase';

const EditorContainer = styled.div`
  background: #2d3748;
  border-radius: 8px;
  padding: 8px;
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #4a5568;

  @media (max-width: 768px) {
    max-width: none;
  }
`;

const EditorTitle = styled.h3`
  margin: 0 0 6px 0;
  color: #cbd5e0;
  font-size: 0.8rem;
  font-weight: 600;
`;

const ModulationItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 1px;
  padding: 4px 8px;
  background: #1a202c;
  border-radius: 4px;
`;

const Label = styled.label`
  flex: 1;
  min-width: 140px;
  color: #cbd5e0;
  font-size: 0.7rem;
  line-height: 1;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const KnobsContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
`;

const KnobWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  
  /* Repositionner la valeur du knob à gauche */
  > div {
    position: relative;
    
    /* Cibler le div de valeur interne du KnobBase et le déplacer à gauche */
    > div:last-child {
      bottom: 20px !important;
      left: -36px !important;
      width: auto;
      text-align: right;
      color: #63b3ed;
      font-weight: bold;
      font-size: 11px;
    }
  }
`;

const KnobLabel = styled.span`
  color: #a0aec0;
  font-size: 0.6rem;
  font-weight: 500;
  text-transform: uppercase;
`;

interface ModulationIndexesEditorProps {
  algorithm: Algorithm;
}

export const ModulationIndexesEditor: React.FC<ModulationIndexesEditorProps> = ({ algorithm }) => {
  const currentPatch = useCurrentPatch();
  const { setHighlightedLink } = useFMSynthContext();

  // Trouver le diagramme de l'algorithme pour connaître les types d'edges
  const diagram = ALGO_DIAGRAMS.find(d => d.id === String(algorithm.id));

  // Collecte toutes les liaisons avec leurs indices à partir des opérateurs du patch
  const modulationLinks: Array<{
    imIndex: number;
    sourceId: number;
    targetId: number;
    im: number;
    modulationIndexVelo: number;
    edgeKind?: "modulation" | "sync";
  }> = [];

  if (!currentPatch || !currentPatch.operators) {
    return (
      <EditorContainer>
        <EditorTitle>Index de Modulation</EditorTitle>
        <p style={{ color: '#718096', fontSize: '0.85rem' }}>Pas de patch</p>
      </EditorContainer>
    );
  }

  currentPatch.operators.forEach((op) => {
    op.target.forEach((targetLink, targetIndex) => {
      // Calculer l'index global de la liaison
      let imIndex = 0;
      for (let i = 0; i < currentPatch.operators.indexOf(op); i++) {
        imIndex += currentPatch.operators[i].target.filter(tl =>
          currentPatch.operators.some(o => o.id === tl.id)
        ).length;
      }
      imIndex += targetIndex;

      // Trouver le type d'edge dans le diagramme
      const edge = diagram?.edges.find(e => 
        e.from === `op${op.id}` && e.to === `op${targetLink.id}`
      );

      modulationLinks.push({
        imIndex,
        sourceId: op.id,
        targetId: targetLink.id,
        im: targetLink.im,
        modulationIndexVelo: targetLink.modulationIndexVelo ?? 0,
        edgeKind: edge?.kind
      });
    });
  });

  const handleIMChange = (sourceId: number, targetId: number, newValue: number) => {
    updateModulationAmount(sourceId, targetId, newValue);
    // Mettre en évidence la liaison pendant l'édition
    setHighlightedLink({ sourceId, targetId });
  };

  const handleVeloChange = (sourceId: number, targetId: number, newValue: number) => {
    updateModulationVelo(sourceId, targetId, newValue);
    setHighlightedLink({ sourceId, targetId });
  };

  if (modulationLinks.length === 0) {
    return (
      <EditorContainer>
        <EditorTitle>Index de Modulation</EditorTitle>
        <p style={{ color: '#718096', fontSize: '0.85rem' }}>Aucune liaison</p>
      </EditorContainer>
    );
  }

  return (
    <EditorContainer>
      <EditorTitle>Index de Modulation</EditorTitle>
      {modulationLinks.map((link) => {
        const isFeedback = link.sourceId === link.targetId;
        
        let label: string;
        if (isFeedback) {
          label = `IM${link.imIndex}: Op${link.sourceId} feedback `;
        } else {
          label = `IM${link.imIndex}: Op${link.sourceId} → Op${link.targetId}`;
        }
        
        return (
          <ModulationItem 
            key={`im-${link.sourceId}-${link.targetId}`}
            onMouseEnter={() => setHighlightedLink({ sourceId: link.sourceId, targetId: link.targetId })}
            onMouseLeave={() => setHighlightedLink(null)}
          >
            <Label>{label}</Label>
            <KnobsContainer>
              <KnobWrapper>
                <KnobLabel>IM</KnobLabel>
                <KnobBase
                  size={50}
                  knobRadius={12}
                  min={0}
                  max={100}
                  value={link.im}
                  onChange={(val) => handleIMChange(link.sourceId, link.targetId, Math.round(val))}
                  color="#0ea5e9"
                  backgroundColor="#1a202c"
                  strokeColor="#4a5568"
                  renderLabel={(val) => Math.round(val)}
                  label={null}
                />
              </KnobWrapper>
              <KnobWrapper>
                <KnobLabel>Velo</KnobLabel>
                <KnobBase
                  size={50}
                  knobRadius={12}
                  min={0}
                  max={100}
                  value={link.modulationIndexVelo}
                  onChange={(val) => handleVeloChange(link.sourceId, link.targetId, Math.round(val))}
                  color="#7c3aed"
                  backgroundColor="#1a202c"
                  strokeColor="#4a5568"
                  renderLabel={(val) => Math.round(val)}
                  label={null}
                />
              </KnobWrapper>
            </KnobsContainer>
          </ModulationItem>
        );
      })}
    </EditorContainer>
  );
};

export default ModulationIndexesEditor;
