

## Corriger la non-apparition de l'étape Validation (migration automatique du localStorage)

### Problème
L'état Istiqamah est persisté dans le `localStorage`. Les sessions créées avant l'ajout de l'étape Validation contiennent un `nodeIndex` qui pointait vers l'ancien flux (3 étapes). Quand cet état est restauré, il peut sauter la Validation ou provoquer un comportement incohérent.

### Solution
Dans `loadIstiqamahState`, ajouter un champ `flowVersion` pour détecter les anciennes sauvegardes et les invalider automatiquement.

### Changement unique

**`src/components/hifz/istiqamah/useIstiqamahState.ts`**

1. Ajouter `FLOW_VERSION = 2` (constante)
2. Dans `saveIstiqamahState` : sauvegarder `flowVersion: FLOW_VERSION` dans l'objet JSON
3. Dans `loadIstiqamahState` : si `data.flowVersion !== FLOW_VERSION`, supprimer l'entrée et retourner `null` (force un redémarrage propre)

Cela invalidera automatiquement toutes les sessions sauvegardées avant l'ajout de Validation, et les utilisateurs repartiront de l'étape Compréhension sans action manuelle.

