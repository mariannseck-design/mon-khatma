

## Plan : Ajouter le bouton favoris en mode texte du Coran

### Problème
En mode texte, quand l'utilisateur clique sur un verset :
- **Sans traduction** : le `VerseTranslationDrawer` s'ouvre (avec le bouton ❤️) — fonctionne
- **Avec traduction** : seul le highlight s'applique, `onVerseSelect` n'est pas appelé → le drawer ne s'ouvre jamais → pas de bouton favori

### Correction : `src/components/quran/QuranTextView.tsx`

Dans le bloc `showTranslation` (lignes ~415-419), ajouter l'appel à `onVerseSelect` dans le `onClick`, identique au mode sans traduction :

```tsx
onClick={(e) => {
  e.stopPropagation();
  setSelectedAyah(prev => prev === ayah.number ? null : ayah.number);
  onVerseSelect?.(`${ayah.surah.number}:${ayah.numberInSurah}`, ayah.surah.number, ayah.numberInSurah);
}}
```

### Fichier modifié
- `src/components/quran/QuranTextView.tsx` — une seule ligne ajoutée dans le handler onClick du mode traduction

