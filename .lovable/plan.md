

## Harmoniser le panneau Paramètres avec le thème vert menthe et or

### Changements dans `ReaderSettingsPanel.tsx`

**Fond du panneau (mode jour)** : Remplacer `#f7f3eb` (crème) par un dégradé menthe `linear-gradient(135deg, #8ed1c4, #a0d9ce)` — identique à la barre d'outils et la carte accueil.

**Bordure** : Remplacer la bordure dorée subtile par une bordure dorée plus visible `rgba(212,175,55,0.4)` pour l'effet bijou cohérent.

**Texte et labels** : Couleur principale passée à `#1a3a3a` (foncé) pour contraste sur fond menthe. Titre "Paramètres" en `#6b5417` or-bronze conservé.

**Boutons actifs (toggles, sélections)** : Remplacer les fonds dorés `rgba(180,150,60,0.15)` par des fonds menthe plus saturés `rgba(255,255,255,0.35)` avec bordure dorée `rgba(180,150,60,0.5)` pour les éléments sélectionnés.

**Boutons inactifs** : Fond blanc semi-transparent `rgba(255,255,255,0.15)` au lieu du doré dilué.

**Bouton Play audio** : Fond actif reste `#4a9a9a`, fond inactif passe à `rgba(255,255,255,0.25)`.

**Select récitateur** : Fond `rgba(255,255,255,0.2)`.

**Bouton fermer (X)** : Fond `rgba(255,255,255,0.2)`.

**Toggle mode nuit** : Track inactif → `rgba(255,255,255,0.3)`, thumb → `#6b5417`.

**Mode nuit** : Garder le fond `#1a2e1a` existant avec accents turquoise inchangés.

**Icône engrenage** dans la barre d'outils : couleur déjà `#4a9a9a`, pas de changement.

| Élément | Avant (jour) | Après (jour) |
|---------|-------------|-------------|
| Fond panneau | `#f7f3eb` crème | `linear-gradient(#8ed1c4, #a0d9ce)` menthe |
| Bordure | `rgba(180,150,60,0.2)` | `rgba(212,175,55,0.4)` or visible |
| Bouton actif | doré 15% | blanc 35% + bordure or |
| Bouton inactif | doré 5% | blanc 15% |
| Texte corps | `#2d3a25` | `#1a3a3a` |

