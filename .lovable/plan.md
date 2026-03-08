

## Plan : Citation du Jour sur le Dashboard

### Nouveau fichier : `src/lib/dailyQuotes.ts`
Tableau de 20 phrases classées par thème (Constance, Répétition, Ascension, Patience). Fonction `getTodayQuote()` qui sélectionne une phrase basée sur le jour de l'année (`dayOfYear % 20`), garantissant un changement à minuit et un cycle complet.

### Nouveau composant : `src/components/accueil/DailyQuote.tsx`
Encadré élégant avec :
- Fond légèrement teinté émeraude (`emerald` à 6% opacité), bordure fine or
- Icône `Sparkles` couleur or à gauche
- Texte en italique, couleur or (`#D4AF37`)
- Animation d'entrée douce via framer-motion

### Modification : `src/pages/AccueilPage.tsx`
Insérer `<DailyQuote />` juste après le greeting (ligne 203), avant l'en-tête fondateur. Import du composant ajouté en haut du fichier.

### Détail des phrases
Les 20 phrases fournies seront stockées avec leur thème (emoji inclus). Les honorifiques `(عز وجل)` et `(عليه السلام)` seront stylés avec la police Amiri en gras conformément à la charte.

