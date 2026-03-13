

## Plan : Messages dynamiques + bouton CTA fixe sur l'écran de succès Hifz

### Fichier modifié : `src/components/hifz/HifzSuccess.tsx`

**1. Tableau de 3 messages aléatoires**

Ajouter un tableau constant avec les 3 blocs (titre + texte). Utiliser `useMemo` ou `useState(() => ...)` pour tirer un index aléatoire une seule fois au montage.

```ts
const SUCCESS_MESSAGES = [
  {
    title: 'Alhamdulillah ! Objectif atteint. 🌟',
    text: 'Vous venez de sceller ces versets dans votre cœur par la répétition. Qu\'Allah (عز وجل) accepte vos efforts, illumine votre poitrine par Son Livre et vous facilite la suite.',
  },
  {
    title: 'Masha\'Allah, un grand pas en avant !',
    text: 'Vos 40 répétitions sont terminées. Qu\'Allah (عز وجل) ancre fermement ces paroles dans votre mémoire. Il est temps de planifier vos révisions quotidiennes.',
  },
  {
    title: 'Phase de Tikrâr terminée !',
    text: 'Félicitations pour votre constance. La mémorisation initiale est validée. Qu\'Allah (عز وجل) bénisse votre temps. Passons à la phase d\'ancrage.',
  },
];
```

Sélection aléatoire au montage :
```ts
const [message] = useState(() => SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)]);
```

**2. Remplacer titre et texte statiques**

- Ligne 72-77 (`<h1>Hifz Validé !</h1>`) → `<h1>{message.title}</h1>`
- Ligne 79-81 (`<p>C'est validé...`) → `<p>{message.text}</p>` avec les mentions `(عز وجل)` stylisées en gras + police Amiri à 1.1em conformément aux règles honorifiques.

**3. Remplacer les deux boutons par un seul CTA fixe**

Supprimer les boutons « Entretien & Révision » et « Retour à l'accueil » (lignes 127-151). Les remplacer par un unique grand bouton doré :

```tsx
<motion.button
  whileTap={{ scale: 0.97 }}
  onClick={() => navigate('/muraja/rabt')}
  className="mx-auto px-8 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-base w-full max-w-xs"
  style={{
    background: 'linear-gradient(135deg, #d4af37, #b8962e)',
    color: '#1a2e1a',
    boxShadow: '0 6px 20px rgba(212,175,55,0.4)',
  }}
>
  Transférer vers la consolidation (Ar-Rabt)
</motion.button>
```

Le design existant (rayons animés, étoile, récap temps) reste inchangé.

