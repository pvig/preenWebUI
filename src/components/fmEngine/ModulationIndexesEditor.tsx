import React from 'react';
import styled from 'styled-components';
import { Algorithm } from '../../types/patch';
import { useCurrentPatch, updateModulationAmount } from '../../stores/patchStore';

const EditorContainer = styled.div`
  background: #2d3748;
  border-radius: 8px;
  padding: 15px;
  width: 200px;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #4a5568;
`;

const EditorTitle = styled.h3`
  margin: 0 0 15px 0;
  color: #cbd5e0;
  font-size: 0.9rem;
  font-weight: 600;
`;

const ModulationItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #4a5568;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const Label = styled.label`
  color: #a0aec0;
  font-size: 0.8rem;
  font-weight: 500;
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Slider = styled.input`
  flex: 1;
  cursor: pointer;
`;

const ValueDisplay = styled.span`
  color: #63b3ed;
  font-size: 0.85rem;
  font-weight: bold;
  min-width: 30px;
  text-align: right;
`;

interface ModulationIndexesEditorProps {
  algorithm: Algorithm;
}

export const ModulationIndexesEditor: React.FC<ModulationIndexesEditorProps> = ({ algorithm }) => {
  const currentPatch = useCurrentPatch();

  // Collecte toutes les liaisons avec leurs indices à partir des opérateurs du patch
  const modulationLinks: Array<{
    imIndex: number;
    sourceId: number;
    targetId: number;
    im: number;
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
      let imIndex = 1;
      for (let i = 0; i < currentPatch.operators.indexOf(op); i++) {
        imIndex += currentPatch.operators[i].target.filter(tl =>
          currentPatch.operators.some(o => o.id === tl.id)
        ).length;
      }
      imIndex += targetIndex + 1;

      modulationLinks.push({
        imIndex,
        sourceId: op.id,
        targetId: targetLink.id,
        im: targetLink.im,
      });
    });
  });

  const handleIMChange = (sourceId: number, targetId: number, newValue: number) => {
    updateModulationAmount(sourceId, targetId, newValue);
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
      {modulationLinks.map((link) => (
        <ModulationItem key={`im-${link.sourceId}-${link.targetId}`}>
          <Label>IM{link.imIndex}: Op{link.sourceId} → Op{link.targetId}</Label>
          <SliderContainer>
            <Slider
              type="range"
              min="0"
              max="100"
              value={link.im}
              onChange={(e) => handleIMChange(link.sourceId, link.targetId, parseInt(e.target.value))}
            />
            <ValueDisplay>{link.im}</ValueDisplay>
          </SliderContainer>
        </ModulationItem>
      ))}
    </EditorContainer>
  );
};

export default ModulationIndexesEditor;
