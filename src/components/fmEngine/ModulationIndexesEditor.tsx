import React from 'react';
import styled from 'styled-components';
import { Algorithm } from '../../types/patch';
import { useCurrentPatch, updateModulationAmount } from '../../stores/patchStore';
import { useFMSynthContext } from './FMSynthContext';
import { ALGO_DIAGRAMS } from '../../algo/algorithms.static';

const EditorContainer = styled.div`
  background: #2d3748;
  border-radius: 8px;
  padding: 10px;
  width: 100%;
  max-width: 260px;
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
  margin: 0 0 8px 0;
  color: #cbd5e0;
  font-size: 0.85rem;
  font-weight: 600;
`;

const ModulationItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid #4a5568;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const Label = styled.label`
  display: inline-block;
  flex: 0 0 95px;
  color: #a0aec0;
  font-size: 0.7rem;
  line-height: 1.1;
  font-weight: 500;
  white-space: nowrap;
`;

const SliderContainer = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  gap: 6px;
`;

const Slider = styled.input`
  flex: 1;
  min-width: 0;
  width: 100%;
  cursor: pointer;
`;

const ValueDisplay = styled.span`
  color: #63b3ed;
  font-size: 0.75rem;
  font-weight: bold;
  min-width: 20px;
  text-align: right;
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
        edgeKind: edge?.kind
      });
    });
  });

  const handleIMChange = (sourceId: number, targetId: number, newValue: number) => {
    updateModulationAmount(sourceId, targetId, newValue);
    // Mettre en évidence la liaison pendant l'édition
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
          label = `IM${link.imIndex}: Op${link.sourceId} ↻ `;
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
            <SliderContainer>
              <Slider
                type="range"
                min="0"
                max="100"
                value={link.im}
                onChange={(e) => handleIMChange(link.sourceId, link.targetId, parseInt(e.target.value))}
                onMouseUp={() => setHighlightedLink(null)}
                onTouchEnd={() => setHighlightedLink(null)}
              />
              <ValueDisplay>{link.im}</ValueDisplay>
            </SliderContainer>
          </ModulationItem>
        );
      })}
    </EditorContainer>
  );
};

export default ModulationIndexesEditor;
