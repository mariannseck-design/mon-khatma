

## Refonte complète de la page Mon Suivi Hifz

### Vision
Transformer la page en un tableau de bord minimaliste avec des cartes blanches suspendues, aligné sur le style de la page Muraja'a.

### Structure redessinée

```text
┌─────────────────────────────────┐
│     Salutation + Citation       │
├─────────────────────────────────┤
│                                 │
│    ╭───── Grand Cercle ─────╮   │  1. Progression Globale
│    │   0 / 6236 Versets     │   │     Cercle fin, dégradé émeraude
│    ╰────────────────────────╯   │     Typo élégante au centre
│                                 │
├─────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐     │  2. Jalons (3 mini-cartes)
│  │ Juz │  │ Hizb│  │Pages│     │     Mini jauge circulaire
│  │ 0/30│  │ 0/60│  │0/604│     │     bg-white rounded-2xl shadow-sm
│  └─────┘  └─────┘  └─────┘     │
├─────────────────────────────────┤
│  Objectif du jour/semaine       │  3. Carte objectif (existante,
│  ████████░░░ 2/5 pages          │     conservée telle quelle)
├─────────────────────────────────┤
│  ┌──────┐ ┌──────┐             │  4. Stats fusionnées (grille 2x2)
│  │🟢 Nouv│ │🟡 Rév │             │     Pilules colorées
│  │  12   │ │  8   │             │     + Streak & Cycles
│  ├──────┤ ├──────┤             │
│  │🔥Streak││🔄Cycles│             │
│  │  5j   │ │  2   │             │
│  └──────┘ └──────┘             │
├─────────────────────────────────┤
│  Graphique 7 jours (conservé)   │  5. Chart hebdo (allégé)
├─────────────────────────────────┤
│  ● 11 mars · +5 versets         │  6. Timeline verticale
│  │                              │     Points colorés + trait fin
│  ● 10 mars · +3 versets         │     Discret et apaisant
│  │                              │
│  ● 9 mars  · +8 versets         │
└─────────────────────────────────┘
```

### Changements dans `src/pages/HifzSuiviPage.tsx`

1. **Progression Globale** — Nouveau grand cercle SVG centré (rayon ~70, trait fin 4px, dégradé émeraude via `<linearGradient>`). Au centre : `totalVerses / 6236 Versets` en Playfair Display. Remplace l'ancien petit `CircularGauge` de la grille 3 KPI.

2. **3 Jalons** — Nouvelle grille `grid-cols-3` avec mini-cartes blanches (`bg-white rounded-2xl shadow-sm`). Chaque carte : icône, label (Juz/Hizb/Pages), valeur, mini cercle SVG de progression. Calculs : `pages = totalVerses` converti via données existantes, `juz = Math.floor(totalVerses / 208)`, `hizb = Math.floor(totalVerses / 104)`.

3. **Stats fusionnées** — Grille 2x2 remplaçant les 3 KPI + la section révisions. Pilules : "Streak 🔥" (jour consécutifs), "Cycles ✅" (tours), "Ar-Rabt" (today hifz count), "Muraja'a" (today revision count). Points colorés : vert/or/orange.

4. **Suppression des 2 cercles** Ar-Rabt/Muraja'a (gros ronds actuels) — L'info de "prochaine session" sera intégrée dans les pilules stats ou accessible via les liens existants en bas.

5. **Graphique hebdo** — Conservé tel quel, déjà aligné sur le style.

6. **Timeline historique** — Remplace la section "Révisions du jour" par une timeline verticale discrète. Petit point coloré (vert pour hifz, or pour muraja'a) relié par un trait fin gris, avec date et "+X versets" en texte discret. Données issues de `weeklyData`.

### Fichier modifié
- `src/pages/HifzSuiviPage.tsx` — Réécriture complète du JSX de rendu (la logique data reste identique)

