// src/utils/patchManager.js
export const loadPatch = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const syxData = new Uint8Array(e.target.result);
      resolve(parseSysex(syxData)); // À implémenter selon le format PreenFM3
    };
    reader.readAsArrayBuffer(file);
  });
};

export const savePatch = (patchData) => {
  const syxData = generateSysex(patchData); // Conversion vers SysEx
  const blob = new Blob([syxData], { type: 'application/octet-stream' });
  return URL.createObjectURL(blob);
};