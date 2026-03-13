

## Problème

L'affichage sourate/versets/page dans `HifzStepWrapper.tsx` (utilisé par toutes les étapes du flux classique, dont Tikrâr) est un simple `<p>` gris sans style particulier (ligne 89-92). Le badge doré n'a été ajouté que dans `StepTikrarFinal.tsx` (flux Istiqamah).

## Correction

**Fichier : `src/components/hifz/HifzStepWrapper.tsx`** — Lignes 89-93

Remplacer le `<p>` simple par un badge doré identique à celui de StepTikrarFinal :

```tsx
// Avant
<p className="text-[11px] text-center -mt-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
  {verseInfo}
</p>

// Après
<div className="flex justify-center -mt-3">
  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
       style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)' }}>
    <span className="text-xs" style={{ color: '#d4af37' }}>📖</span>
    <span className="text-xs font-medium" style={{ color: 'rgba(212,175,55,0.85)' }}>
      {verseInfo}
    </span>
  </div>
</div>
```

Un seul fichier, un seul bloc modifié. Ce changement s'applique à **toutes** les étapes du flux classique (pas seulement Tikrâr).

