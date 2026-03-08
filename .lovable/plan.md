

## Adapter le "Bonjour" à l'heure de la journée

### Changement
Dans `src/pages/AccueilPage.tsx` ligne 214, remplacer le texte statique "Bonjour" par un salut adapté à l'heure :

- Matin (< 12h) : "Bonjour"
- Après-midi (12h-18h) : "Bon après-midi"
- Soir/Nuit (≥ 18h) : "Bonsoir"

```tsx
// Ligne 214 : au lieu de
<p>Bonjour {displayName} 🤍</p>

// On utilise une fonction qui adapte le salut
const timeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
};

<p>{timeGreeting()} {displayName} 🤍</p>
```

### Fichier modifié
- **`src/pages/AccueilPage.tsx`** : Ajouter `timeGreeting()` et l'utiliser à la place de "Bonjour" statique.

