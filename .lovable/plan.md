

## Plan : Minuteur Pomodoro pour Hifz

### Composant reutilisable

Creer `src/components/hifz/PomodoroTimer.tsx` — un composant autonome qui gere toute la logique du minuteur :

- **Etat** : `idle` | `focus` | `paused` | `break`
- **Minuteur** : `useRef(setInterval)` avec decompte chaque seconde
- **Pop-up de choix** (Dialog non-bloquant) : au premier clic, affiche le texte recommande avec deux boutons : "Confirmer (25 min)" et "Personnaliser" (dropdown 15/30/45/60 min)
- **Notification douce** : quand le focus est termine, affiche un bandeau anime (pas une modale bloquante) avec felicitations + bouton "Lancer la pause de 5 min"
- **Affichage** : bandeau discret en haut, fond semi-transparent dore/vert fonce, avec le temps restant (MM:SS), bouton Play/Pause et bouton Reset
- **Non-bloquant** : le minuteur est un overlay leger positionne en haut, pas de modale bloquante, pas d'interruption du scroll ou de l'audio

### Design

```text
┌─────────────────────────────────────┐
│  ⏱ 22:34  ▶/⏸  ↺                  │  ← bandeau discret, fond rgba(gold, 0.1)
├─────────────────────────────────────┤
│                                     │
│  [contenu existant inchange]        │
│                                     │
└─────────────────────────────────────┘
```

Couleurs : fond `rgba(212,175,55,0.08)`, bordure `rgba(212,175,55,0.2)`, texte temps en `#d4af37`, icones en `rgba(255,255,255,0.5)`.

### Integration

**`StepImmersion.tsx`** : Ajouter `<PomodoroTimer />` en haut du composant, juste apres l'en-tete decoratif, avant le contenu Mushaf.

**`StepTikrarFinal.tsx`** : Ajouter `<PomodoroTimer />` en haut, juste apres l'en-tete avec l'icone etoile et le titre.

### Comportement detaille

1. **Etat initial** : icone minuteur + "Pomodoro" en texte discret, cliquable
2. **Clic** → Dialog (non-bloquant, fond semi-transparent) avec texte + 2 boutons
3. **Apres choix** → le bandeau affiche le decompte, boutons Play/Pause et Reset
4. **Fin du focus** → vibration douce (30ms) + bandeau vert "Bravo ! Prenez une pause" + bouton "Pause 5 min"
5. **Fin de pause** → vibration douce + bandeau "Pause terminée, on reprend !" qui disparait apres 5s ou au clic
6. **Reset** → retour a l'etat initial
7. L'etat du timer persiste dans un `useRef` local (pas de localStorage, c'est ephemere)

### Fichiers modifies

| Fichier | Modification |
|---|---|
| `src/components/hifz/PomodoroTimer.tsx` | **Nouveau** — composant complet |
| `src/components/hifz/istiqamah/StepImmersion.tsx` | Ajouter `<PomodoroTimer />` en haut |
| `src/components/hifz/istiqamah/StepTikrarFinal.tsx` | Ajouter `<PomodoroTimer />` en haut |

