

## Plan : Refonte de l'étape 3 — "Tikrar" avec objectif 40 et mode d'emploi par phases

### Vue d'ensemble

Transformer l'étape 3 (Mémorisation Active) en une expérience guidée "Tikrar" avec un objectif fixe de 40 répétitions, un mode d'emploi par phases (1-10, 11-15, 16+), un message de bienveillance, et une célébration finale.

### Modifications

**`src/components/hifz/HifzStep3Memorisation.tsx`** — Refonte complète :

1. **Titre et sous-titre** : Remplacer "Mémorisation Active" par "Tikrar" dans le stepTitle. Ajouter un sous-titre "L'ancrage d'acier (Objectif 40 répétitions)" sous l'icône.

2. **Objectif fixe à 40** : Ignorer le `repetitionLevel` passé en props et utiliser 40 comme cible. Le bouton "Étape suivante" ne s'affiche en mode complet (gradient doré) qu'à 40/40. Le bouton "Passer quand même" reste disponible dès 1 répétition pour la flexibilité.

3. **Mode d'emploi par phases** — Afficher dynamiquement une indication contextuelle selon la phase en cours :
   - `ancrage 0-10` : "📖 Regardez le Mushaf et récitez avec le récitant" — Mushaf visible par défaut, audio activé
   - `ancrage 11-15` : "📖 Regardez le Mushaf, récitez sans le récitant" — Mushaf visible, bouton Play masqué/désactivé
   - `ancrage 16+` : "🧠 Récitez de mémoire, sans Mushaf ni audio" — Mushaf masqué automatiquement, Play désactivé

   Cette indication apparaît dans une petite barre colorée sous le compteur circulaire.

4. **Message de bienveillance** — Apparaît à partir de la 16ème répétition dans une bulle discrète en italique avec fond semi-transparent :
   > « N'ayez aucune crainte si vous devez jeter un coup d'œil furtif au Mushaf après la 15ème répétition. Le cerveau apprend aussi par la correction. Ce n'est pas un échec, mais une étape vers la maîtrise parfaite. L'essentiel est la sincérité de votre effort pour plaire à Allah **<span style="font-family:'Amiri'">(عز وجل)</span>**, à l'image de la persévérance des Prophètes **<span style="font-family:'Amiri'">(عليهم السلام)</span>**. »

5. **Aide ponctuelle (phase 16+)** — Même si le Mushaf est masqué automatiquement, conserver le bouton "Voir le passage" pour un coup d'œil rapide. Conserver aussi un petit bouton haut-parleur discret pour une vérification audio ponctuelle.

6. **Célébration à 40/40** — Quand `ancrage` atteint 40, afficher une animation de célébration inline (confettis dorés + message) :
   > « Félicitations ! Votre ancrage Tikrar est terminé. Par la grâce d'Allah **<span style="font-family:'Amiri'">(عز وجل)</span>**, vous avez honoré ce dépôt sacré. »

   Avec le bouton "Passer au test de validation" en gradient doré complet.

7. **Honorifiques** : Mettre à jour le texte existant pour utiliser les honorifiques corrects en arabe (Amiri, gras, 1.1em) conformément aux règles du projet.

### Fichiers modifiés

- `src/components/hifz/HifzStep3Memorisation.tsx` — Seul fichier modifié

