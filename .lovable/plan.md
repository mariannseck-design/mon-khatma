

## Refonte chromatique Premium — Muraja'a + Suivi Hifz

Remplacement systématique de l'ancienne palette turquoise/transparente par la nouvelle charte émeraude/or/parchemin sur 5 fichiers.

### Palette de référence

```text
Primary (Émeraude)     #065F46
Accent (Or)            #D4AF37
Background page        #FDFBF7
Texte principal        #1C2421
Card blanc             #FFFFFF  shadow: 0 4px 20px rgba(6,95,70,0.06)
Card active            #F0F7F4
Track jauge            #E6F0ED
Jauge remplie          gradient #065F46 → #044E3B
Difficile              #9B1C31
Moyen                  #D97706 (remplace l'or "Bien")
Facile                 #065F46
Checkbox non cochée    border #065F46, fond transparent
Checkbox cochée        fond #D4AF37, check #FFFFFF
```

### Fichiers modifiés

**1. `src/pages/MurjaPage.tsx`**
- Fond page : ajouter `style={{ backgroundColor: '#FDFBF7' }}` sur le wrapper
- Icône header : fond `#F0F7F4`, border `#065F46` au lieu de rgba gold
- Titre h1 : couleur `#065F46` au lieu de `#d4af37`
- Sous-titre : couleur `#1C2421` opacity 60%
- Empty state : gradient `#065F46 → #044E3B`, border `#D4AF37`
- Progress bar label : `#065F46` au lieu de `#0d7377`
- Progress bar track : `#E6F0ED` ; fill : gradient `#065F46 → #044E3B`
- Section titles (Ar-Rabt, Le Tour) : `#1C2421` ; badge count : fond `#F0F7F4`, texte `#065F46`
- Mon trésor card : fond `#FFFFFF`, shadow `0 4px 20px rgba(6,95,70,0.06)`, border `#E6F0ED`
- Lignes trésor : fond `#F0F7F4`, texte `#065F46`
- Bouton Actualiser : `#065F46`

**2. `src/components/muraja/MurajaChecklist.tsx`**
- Empty state : fond `#FFFFFF`, shadow card, border `#E6F0ED`, icône `#D4AF37`
- Item non coché : fond `#FFFFFF`, border `#E6F0ED`
- Item coché : fond `#F0F7F4`, border `#D4AF37`
- Checkbox non cochée : border `#065F46`, fond transparent
- Checkbox cochée : fond `#D4AF37`, check `#FFFFFF`
- Texte surah non coché : `#1C2421` ; coché : `#065F46` bold
- Ratings : Difficile `#9B1C31`, Moyen `#D97706` (label "Moyen", key "good"), Facile `#065F46`
- Cap message : fond `rgba(212,175,55,0.08)`, border/text `#D4AF37`

**3. `src/components/muraja/MurajaCountdown.tsx`**
- Ring track : `#E6F0ED`
- Ring fill : `#065F46`
- Inner circle : fond `#FFFFFF`, border `#065F46`, shadow `0 4px 20px rgba(6,95,70,0.06)`
- Timer text : `#065F46` au lieu de gold
- Seconds : `#1C2421` opacity 40%
- Label "Reset dans" : `#D4AF37`

**4. `src/components/muraja/MurajaCelebration.tsx`**
- Modal background : gradient `#065F46 → #044E3B`, border `#D4AF37`
- Rays : `rgba(212,175,55,0.3)` (inchangé)
- Star icon, title : `#D4AF37` (inchangé)
- Body text : `#FDFBF7` opacity 90%
- Button : fond `#D4AF37`, texte `#065F46`

**5. `src/pages/HifzSuiviPage.tsx`**
- Fond page : `backgroundColor: '#FDFBF7'`
- Greeting h1 : `#065F46`
- Goal card : fond `#FFFFFF`, shadow card, border `#E6F0ED`
- Goal labels : `#1C2421`, values `#D4AF37`
- Progress bar : track `#E6F0ED`, fill gradient `#065F46 → #044E3B`
- Programme du jour card : fond `#F0F7F4`, border `#E6F0ED`
- Révision du jour card : fond `#FFFFFF`, shadow, border `#E6F0ED`
- Inner items : fond `#F0F7F4`
- KPI cards (3 colonnes) : fond `#FFFFFF`, shadow, border `#E6F0ED`
- KPI values : `#065F46` au lieu de `#0d7377`
- KPI icons : `#D4AF37` (inchangé)
- Weekly chart card : fond `#FFFFFF`, shadow, border `#E6F0ED`
- Chart bars actives : `#D4AF37` opacity 85% ; inactives : `#E6F0ED`
- CircularGauge : track `#E6F0ED`, stroke `#065F46`, text `#065F46`
- Empty state : gradient `#065F46 → #044E3B`
- Goal edit wrapper : gradient `#065F46 → #044E3B`
- No goal button : fond `#F0F7F4`, border dashed `#D4AF37`
- All `text-white` references → `#FDFBF7` or `#1C2421` depending on background
- All `#0d7377` / `#14919b` → `#065F46`

