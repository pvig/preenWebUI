// src/components/PresetManager.jsx
import { usePatchStore } from '../stores/patchStore';
import {savePatch} from '../utils/patchManager';

function PatchManager () {
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

export default PatchManager;