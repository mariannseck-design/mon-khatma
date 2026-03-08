

## Plan : Sagesse & Invocation du Jour (Citations + Douas)

### 1. `src/lib/dailyQuotes.ts`
- Ajouter un champ `type: 'citation' | 'doua'` à l'interface
- Ajouter les 10 douas (thème `🤲`) à la liste existante (total 30 éléments)
- Corriger la typo `(عz وجl)` → `(عز وجل)` dans le 3e doua
- La fonction `getTodayQuote()` reste identique (`dayOfYear % 30`)

### 2. `src/components/accueil/DailyQuote.tsx`
- **Icône conditionnelle** : `Sparkles` pour les douas, `PenLine` pour les citations
- **Couleurs** : remplacer le doré `#D4AF37` par les couleurs émeraude/sage du Dashboard :
  - Texte : `#2d6a4f` (emerald)
  - Icône : `#52796f` (sage)
  - Bordure : `rgba(45, 106, 79, 0.2)` (emerald subtil)
  - Fond : `rgba(6, 95, 70, 0.06)` (inchangé, déjà émeraude)

### Fichiers modifiés
- `src/lib/dailyQuotes.ts`
- `src/components/accueil/DailyQuote.tsx`

