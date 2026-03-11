

## Réorganisation de la page Accueil + ajout Coran dans Hifz Hub

### Résumé

1. **Supprimer le toggle tabs** (PRINCIPAL / MON UNIVERS) de la page Accueil
2. **Fusionner tout sur une seule page** avec une barre verte "Ma Khatma" comme séparateur visuel
3. **Copier la carte "Le Noble Coran"** dans le Hifz Hub (en plus de la garder sur l'Accueil)

### Fichiers modifiés

#### `src/pages/AccueilPage.tsx`
- Supprimer le state `activeTab` et le toggle tabs (lignes 291-317)
- Afficher le contenu sur une seule page dans cet ordre :
  1. Greeting + Citation + Carte pages lues (inchangé)
  2. **Carte "Le Noble Coran"** (sortie de l'onglet Principal, toujours visible)
  3. **Barre verte** avec texte "MA KHATMA" (même fond émeraude que le tab MON UNIVERS actif) comme séparateur de section
  4. En dessous : Ma Khatma (lien planificateur), Versets favoris, Nos Défis, Espace Communauté, Weekly Report, Citation spirituelle, PWA Install, Partage
- Les défis et Ma Khatma restent intacts, ils sont juste sortis du système d'onglets

#### `src/pages/HifzHubPage.tsx`
- Ajouter une carte "Le Noble Coran" en haut du hub (avant Tikrar), identique à celle de l'Accueil
- Utiliser `useAuth` pour `hasFullAccess` et conditionner l'accès comme sur l'Accueil
- Importer `BookOpenCheck` de lucide-react

### Structure finale de l'Accueil

```text
┌─────────────────────┐
│  Greeting + Citation │
│  Carte pages lues    │
│  Le Noble Coran      │
├─────────────────────┤
│ ████ MA KHATMA ████ │  ← barre verte pleine
├─────────────────────┤
│  Ma Khatma (objectif)│
│  Versets favoris     │
│  Nos Défis           │
│  Communauté          │
│  Weekly Report       │
│  Citation            │
│  PWA / Partage       │
└─────────────────────┘
```

