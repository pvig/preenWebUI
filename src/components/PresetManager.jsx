// src/components/PresetManager.jsx
import { savePatch } from '../utils/patchManager';

export const PresetManager = () => {
  const { patch } = usePatchStore();

  const handleSave = () => {
    const url = savePatch(patch);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preenfm_patch_${Date.now()}.syx`;
    a.click();
  };

  return (
    <div>
      <button onClick={handleSave}>Sauvegarder</button>
      <input 
        type="file" 
        accept=".syx" 
        onChange={(e) => loadPatch(e.target.files[0])} 
      />
    </div>
  );
};