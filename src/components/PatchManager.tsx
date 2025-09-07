// src/components/PresetManager.jsx
import { useCurrentPatch } from '../stores/patchStore';
import { usePatchStore } from '../stores/patchStore';

function PatchManager() {
  const { savePatch } = usePatchStore();
  const currentPatch = useCurrentPatch();

  const handleSave = () => {
    const url = savePatch(currentPatch);
    /*const a = document.createElement('a');
    a.href = url;
    a.download = `preenfm_patch_${Date.now()}.syx`;
    a.click();*/
  };
  const handleLoad = (file) => {
    console.log("file", file);
  };

  return (
    <div>
      <button onClick={handleSave}>Sauvegarder</button>
      <input
        type="file"
        accept=".syx"
        onChange={(e) => handleLoad(e.target.files[0])}
      />
    </div>
  );
};

export default PatchManager;