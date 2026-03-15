

## Plan : Lien Mushaf + indication sous le compteur audio

### Modification unique : `src/components/hifz/HifzStep3Memorisation.tsx`

Ajouter un petit bloc juste **après les contrôles audio** (après ligne 737, avant la fermeture du `</div>` de `space-y-3`) — visible uniquement quand l'audio est en cours de lecture (`isPlaying`).

Contenu :

```tsx
{isPlaying && (
  <p className="text-center text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
    📖{' '}
    <button
      onClick={(e) => {
        e.stopPropagation();
        // Navigate to mushaf at the right page
        getExactVersePage(surahNumber, startVerse).then(page => 
          navigate(`/quran-reader?page=${page}`)
        );
      }}
      className="underline"
      style={{ color: 'rgba(212,175,55,0.6)' }}
    >
      Lire sur le Mushaf
    </button>
    {' '}— le compteur reprend dès votre retour
  </p>
)}
```

**Imports à ajouter** :
- `useNavigate` de `react-router-dom`
- `getExactVersePage` de `@/lib/quranData` (déjà importé via `getVersesByRange`)

**Résultat** : Quand l'audio tourne, une ligne discrète apparaît sous les boutons avec un lien cliquable vers le Mushaf. Le texte est court : « 📖 Lire sur le Mushaf — le compteur reprend dès votre retour ».

