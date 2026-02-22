# PreenFM3 MIDI Integration

Ce dossier contient l'implémentation de la communication MIDI avec le PreenFM3.

## Architecture

### Fichiers

- **`preenFM3MidiMap.ts`** - Mappage des CC et NRPN du PreenFM3
- **`midiService.ts`** - Service de bas niveau pour l'envoi/réception MIDI
- **`usePreenFM3Midi.ts`** - Hook React pour l'intégration MIDI
- **`../components/MidiConfiguration.tsx`** - Composant UI de configuration MIDI

## Utilisation

### 1. Configuration MIDI

Ajouter le composant de configuration dans l'interface :

```tsx
import { MidiConfiguration } from './components/MidiConfiguration';

function App() {
  return (
    <div>
      <MidiConfiguration />
      {/* ... autres composants */}
    </div>
  );
}
```

### 2. Utilisation du hook MIDI

```tsx
import { usePreenFM3Midi } from './midi/usePreenFM3Midi';

function MyComponent() {
  const midi = usePreenFM3Midi();

  const handleAlgoChange = (algoId: number) => {
    // Envoyer le changement d'algorithme au PreenFM3
    midi.sendAlgorithmChange(algoId);
  };

  const handleIMChange = (imNumber: number, value: number) => {
    // Envoyer le changement d'IM au PreenFM3
    midi.sendIMChange(imNumber, value);
  };

  // Écouter les changements venant du PreenFM3
  useEffect(() => {
    midi.listenToCC((controller, value, channel) => {
      console.log(`Reçu CC ${controller} = ${value}`);
      // Mettre à jour l'état local
    });
  }, []);

  return <div>...</div>;
}
```

### 3. Synchronisation automatique du patch

```tsx
import { usePatchMidiSync } from './midi/usePreenFM3Midi';

function PatchEditor() {
  const [midiSyncEnabled, setMidiSyncEnabled] = useState(true);
  const { midi, syncAlgorithm, syncModulationIndex } = usePatchMidiSync(midiSyncEnabled);

  const handleAlgorithmChange = (algo: Algorithm) => {
    // Mettre à jour le store local
    updatePatch({ algorithm: algo });
    
    // Synchroniser avec le hardware
    syncAlgorithm(algo.id);
  };

  return <div>...</div>;
}
```

## Protocole MIDI

### Control Changes (CC)

Le PreenFM3 utilise des CC pour les paramètres principaux :

| Paramètre | CC | Valeurs |
|-----------|-----|---------|
| Algorithme | 20 | 0-31 (32 algos) |
| IM1 | 21 | 0-100 (→ 0.0-10.0) |
| IM2 | 22 | 0-100 |
| IM3 | 23 | 0-100 |
| IM4 | 24 | 0-100 |
| IM5 | 25 | 0-100 |
| IM Feedback | 26 | 0-127 |
| Mix OP1-4 | 27-30 | 0-127 |
| Pan OP1-4 | 31-34 | 0-127 (64=center) |
| Freq OP1-6 | 35-40 | 0-127 |
| ENV Attack OP1-6 | 70-75 | 0-127 (→ 0-16s) |
| ENV Release OP1-6 | 80-85 | 0-127 (→ 0-32s) |

Voir `preenFM3MidiMap.ts` pour la liste complète.

### NRPN (Non-Registered Parameter Numbers)

Les NRPN sont utilisés pour :
- Tous les paramètres détaillés (résolution 14 bits)
- Dump complet de patch
- Nom de preset (12 caractères)
- Step sequencer

#### Structure NRPN

Un message NRPN est composé de 4 CC :

```
CC 99 = Parameter MSB
CC 98 = Parameter LSB
CC 6  = Value MSB
CC 38 = Value LSB
```

#### Exemples

**Récupérer un patch du PreenFM3 :**
```typescript
// Envoyer NRPN [127, 127] = [0, timbre]
midi.sendNRPN({ paramMSB: 127, paramLSB: 127, valueMSB: 0, valueLSB: 0 });
// → Le PreenFM3 envoie le patch complet en NRPN
```

**Changer le nom du preset :**
```typescript
// Caractère 0 (premier caractère) = 'A' (65)
midi.sendNRPN({ 
  paramMSB: 1,     // Nom de preset
  paramLSB: 100,   // Caractère 0
  valueMSB: 0,     // 65 >> 7 = 0
  valueLSB: 65     // 65 & 0x7F = 65
});
```

## Configuration PreenFM3

Dans le menu du PreenFM3 (Menu → Midi) :

1. **USB MIDI** : In + Out
2. **Receives** : CC + NRPN
3. **Sends** : CC ou NRPN (selon préférence)
4. **MIDI Channel** : Doit correspondre au canal sélectionné dans l'UI

## Limitations

- Web MIDI API requiert HTTPS (ou localhost)
- Navigateurs supportés : Chrome, Edge, Opera (pas Safari/Firefox sans flag)
- Le PreenFM3 doit être connecté via USB

## Prochaines étapes

1. ✅ Mappage CC/NRPN complet
2. ✅ Service MIDI de base
3. ✅ Hook React et composant UI
4. ⏳ Parser SysEx pour patches
5. ⏳ Bidirectionnel complet (UI ↔ Hardware)
6. ⏳ Gestion des presets/banks
7. ⏳ NRPN dump/load de patch complet

## Prérequis et Permissions

### Navigateurs compatibles

Web MIDI API est supporté nativement par :
- ✅ **Chrome/Chromium** (version 43+)
- ✅ **Edge** (version 79+)
- ✅ **Brave** (toutes versions)
- ✅ **Opera** (version 33+)
- ⚠️ **Firefox** : Nécessite l'activation manuelle du flag `dom.webmidi.enabled`
- ❌ **Safari** : Non supporté

**Recommandation** : Utilisez Brave, Chrome ou Edge pour la meilleure expérience.

### Activer Web MIDI

#### Chrome / Edge / Brave / Opera

1. Connectez votre PreenFM3 via USB
2. Ouvrez l'application web
3. Une popup de permission apparaîtra automatiquement
4. Cliquez sur **Autoriser**

Si la popup n'apparaît pas :
1. Cliquez sur l'icône 🔒 (cadenas) dans la barre d'adresse
2. Allez dans **Paramètres du site**
3. Trouvez **Périphériques MIDI** et sélectionnez **Autoriser**
4. Actualisez la page

#### Firefox (Support expérimental)

Firefox ne supporte pas Web MIDI par défaut. Pour l'activer :

1. Tapez `about:config` dans la barre d'adresse
2. Acceptez l'avertissement
3. Recherchez `dom.webmidi.enabled`
4. Double-cliquez pour passer la valeur à `true`
5. Redémarrez Firefox

**Note** : Le support Web MIDI dans Firefox est expérimental et peut être instable.

## Références

- [Firmware PreenFM3 - MidiDecoder.cpp](https://github.com/Ixox/preenfm3/blob/master/firmware/Src/midi/MidiDecoder.cpp)
- [Web MIDI API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API)
- [WebMIDI.js Library](https://webmidijs.org/)
