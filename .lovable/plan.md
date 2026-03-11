

## Plan : Barre MA KHATMA en doré

Changer le fond de la barre "MA KHATMA" de vert émeraude vers un dégradé doré, cohérent avec le style du Noble Coran.

### Modification unique dans `AccueilPage.tsx` (lignes 206-212)

Remplacer `background: COLORS.emerald` par un dégradé doré, et ajuster les couleurs du texte/icône pour le contraste :

- Fond : `linear-gradient(135deg, #b5942e, #d4af37)` (dégradé or)
- Icône Target : blanc ou émeraude foncé
- Texte : blanc (reste lisible sur doré)
- Sous-texte : `white/80`

