

## Mettre les boutons de validation des défis en blanc

### Changements

**`src/components/defis/DefiAlKahf.tsx`** :
- Bouton "Valider ma lecture d'Al-Kahf" : `background: '#fff'`, `color: COLORS.cave`
- État validé "Lecture validée cette semaine" : `background: 'rgba(255,255,255,0.15)'`, `color: '#fff'`
- Texte "Disponible jeudi soir..." : `color: 'rgba(255,255,255,0.6)'`
- Bouton célébration "Alhamdulillah" : `background: '#fff'`, `color: COLORS.cave`

**`src/components/defis/DefiAlMulk.tsx`** :
- Bouton célébration "Alhamdulillah" : `background: '#fff'`, `color: '#1b4332'`

**`src/components/defis/DefiAlBaqara.tsx`** :
- Bouton "Lancer le défi" : `background: '#fff'`, `color: COLORS.emerald`
- Bouton "Valider ma lecture du jour" (non coché) : `background: 'rgba(255,255,255,0.9)'`, `color: COLORS.emerald`
- Bouton "Lecture du jour validée" (coché) : `background: '#fff'`, `color: COLORS.emerald`

Tous les boutons d'action passent en fond blanc avec texte de la couleur thématique de chaque carte.

