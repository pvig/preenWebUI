import PatchManager from '../components/PatchManager';

export function PatchLibrary() {
  return (
    <div className="library-container">
      <h2>Librairie de Patches</h2>
      <div className="library-content">
        <PatchManager />
      </div>
    </div>
  );
}