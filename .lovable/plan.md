

# Fix: La Mémorisation est sautée après la Compréhension

## Cause du bug

Dans `StepComprehension`, le bouton de confirmation appelle `setTimeout(onNext, 1800)`. Si l'utilisateur tape deux fois sur le bouton (ou si le composant ne bloque pas les clics multiples), `onNext` est appelé deux fois avec un délai de 1.8s chacun. Cela fait passer l'index de 0 (Compréhension) → 1 (Mémorisation) → 2 (Tikrar), sautant complètement l'étape de mémorisation.

## Solution

**Fichier** : `src/components/hifz/istiqamah/StepComprehension.tsx`

Ajouter un garde pour empêcher les appels multiples à `onNext` :

```ts
const [confirmed, setConfirmed] = useState(false);

const handleConfirm = () => {
  if (confirmed) return; // empêcher le double-tap
  setConfirmed(true);
  setShowMessage(true);
  setTimeout(onNext, 1800);
};
```

Et désactiver visuellement le bouton quand `confirmed` est `true` (opacity réduite, `pointer-events: none`).

## Impact
- Corrige le saut de l'étape Mémorisation (verset par verset)
- Le parcours redevient : Compréhension → Mémorisation → Tikrar

