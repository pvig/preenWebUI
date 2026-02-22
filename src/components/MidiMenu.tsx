import '../assets/css/MidiMenu.css';
import { usePreenFM3Midi } from '../midi/usePreenFM3Midi';
import { requestPatchDump } from '../midi/midiService';
import { useCurrentPatch, usePatchStore } from '../stores/patchStore';
import { PreenFM3Parser } from '../midi/preenFM3Parser';
import { useState, useRef } from 'react';

export const MidiMenu = () => {
  const midi = usePreenFM3Midi();
  const currentPatch = useCurrentPatch();
  const { loadPatch } = usePatchStore();
  const parserRef = useRef<PreenFM3Parser>(new PreenFM3Parser());
  const [receivedCount, setReceivedCount] = useState(0);
  const [receivedName, setReceivedName] = useState('');

  // Envoi d'un patch au PreenFM3 (Push)
  const sendPatch = () => {
    if (!midi.selectedOutput) {
      alert('Aucune sortie MIDI sélectionnée');
      return;
    }

    // TODO: Implémenter la conversion du patch en SysEx ou NRPN
    console.log('Patch à envoyer:', currentPatch);
    console.log('Fonctionnalité Push en cours de développement...');
    
    // Pour l'instant, on peut au moins envoyer l'algorithme
    if (currentPatch?.algorithm) {
      midi.sendAlgorithmChange(String(currentPatch.algorithm.id));
    }
  };

  // Réception d'un patch depuis le PreenFM3 (Pull)
  const receivePatch = () => {
    if (!midi.selectedInput) {
      alert('Aucune entrée MIDI sélectionnée');
      return;
    }

    console.log('🎹 Demande de patch au PreenFM3...');
    
    // Réinitialiser le parser
    parserRef.current.reset();
    setReceivedCount(0);
    setReceivedName('');
    
    requestPatchDump(0, midi.channel); // Timbre 0
    
    // Écouter les NRPN entrants
    midi.listenToNRPN((nrpn, _channel) => {
      // Ajouter au parser
      parserRef.current.addNRPN(nrpn);
      
      // Mettre à jour l'affichage
      const stats = parserRef.current.getStats();
      setReceivedCount(stats.count);
      setReceivedName(stats.name);
      
      // Logger de manière plus lisible
      const paramIndex = (nrpn.paramMSB << 7) | nrpn.paramLSB;
      const value = (nrpn.valueMSB << 7) | nrpn.valueLSB;
      console.log(`📥 NRPN [${nrpn.paramMSB},${nrpn.paramLSB}] (idx=${paramIndex}) = [${nrpn.valueMSB},${nrpn.valueLSB}] (val=${value})`);
    });

    // Attendre un peu puis convertir et charger le patch
    setTimeout(() => {
      console.log('=== Réception terminée ===');
      parserRef.current.logAll();
      
      // Convertir les NRPN en Patch et charger dans le store
      try {
        const patch = parserRef.current.toPatch();
        console.log('✅ Patch converti:', patch);
        loadPatch(patch);
        console.log('✅ Patch chargé dans l\'UI');
      } catch (error) {
        console.error('❌ Erreur lors de la conversion du patch:', error);
      }
    }, 2000);
  };

  if (midi.isLoading) {
    return (
      <div className="midi-menu">
        <p>Initialisation MIDI...</p>
      </div>
    );
  }

  if (midi.error) {
    return (
      <div className="midi-menu">
        <div className="midi-error-container">
          <p className="error">❌ {midi.error}</p>
          <div className="midi-help">
            <h4>Web MIDI API requis</h4>
            <p>Pour utiliser la connexion MIDI avec le PreenFM3, vous devez :</p>
            <ol>
              <li>Utiliser un navigateur compatible (Chrome, Edge, Brave, Opera)</li>
              <li>Autoriser l'accès MIDI dans les permissions du site</li>
              <li>Connecter votre PreenFM3 via USB</li>
            </ol>
            <p className="help-note">
              💡 <strong>Chrome/Edge/Brave :</strong> Cliquez sur l'icône de cadenas dans la barre d'adresse → 
              Paramètres du site → Autorisez "Périphériques MIDI"
            </p>
            <p className="help-note">
              💡 <strong>Firefox :</strong> Tapez <code>about:config</code> → 
              Recherchez <code>dom.webmidi.enabled</code> → Activez-le (support expérimental)
            </p>
          </div>
        </div>
      </div>
    );
  }

  const noDevices = !midi.devices || (midi.devices.inputs.length === 0 && midi.devices.outputs.length === 0);

  return (
    <div className="midi-menu">
      {noDevices && (
        <div className="midi-info">
          <p>⚠️ Aucun périphérique MIDI détecté</p>
          <p className="info-detail">Connectez votre PreenFM3 via USB et actualisez la page</p>
        </div>
      )}
      
      <div className="midi-ports">
        <div className="midi-port-select">
          <label>
            Entrée MIDI:
            <select 
              value={midi.selectedInput?.id || ''}
              onChange={(e) => {
                const input = midi.devices?.inputs.find(i => i.id === e.target.value);
                midi.selectInput(input || null);
              }}
            >
              <option value="">-- Sélectionner --</option>
              {midi.devices?.inputs.map(input => (
                <option key={input.id} value={input.id}>
                  {input.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="midi-port-select">
          <label>
            Sortie MIDI:
            <select 
              value={midi.selectedOutput?.id || ''}
              onChange={(e) => {
                const output = midi.devices?.outputs.find(o => o.id === e.target.value);
                midi.selectOutput(output || null);
              }}
            >
              <option value="">-- Sélectionner --</option>
              {midi.devices?.outputs.map(output => (
                <option key={output.id} value={output.id}>
                  {output.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="midi-port-select">
          <label>
            Canal MIDI:
            <select 
              value={midi.channel}
              onChange={(e) => midi.changeChannel(parseInt(e.target.value))}
            >
              {Array.from({ length: 16 }, (_, i) => i + 1).map(ch => (
                <option key={ch} value={ch}>
                  Canal {ch}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {receivedCount > 0 && (
        <div className="midi-reception-status">
          <p>📥 Réception: {receivedCount} paramètres</p>
          {receivedName && <p className="patch-name">Patch: "{receivedName}"</p>}
        </div>
      )}

      <div className="midi-actions">
        <button 
          onClick={sendPatch}
          disabled={!midi.selectedOutput}
          className="midi-button"
          title="Envoyer le patch actuel vers le PreenFM3"
        >
          Push → PreenFM
        </button>
        
        <button 
          onClick={receivePatch}
          disabled={!midi.selectedInput}
          className="midi-button"
          title="Récupérer le patch actuel depuis le PreenFM3"
        >
          Pull ← PreenFM
        </button>
      </div>

      {midi.enabled && (midi.selectedInput || midi.selectedOutput) && (
        <div className="midi-status">
          <div className="status-indicator connected">
            ● Connecté
          </div>
        </div>
      )}
    </div>
  );
};