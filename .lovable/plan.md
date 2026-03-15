Objectif
Corriger définitivement le bug “répétition de syllabe au début du 2e verset” et garantir que Play/Pause/Stop arrêtent toujours la chaîne audio.

Diagnostic ciblé (sur le code actuel)
- `HifzStepImpregnationTajweed.tsx` enchaîne les versets via callbacks `onended/onerror`, mais la chaîne n’est pas assez protégée contre les callbacks obsolètes.
- Le composant ne vérifie pas `isPlayingRef` dans `playNextAyah` avant de continuer, donc un callback tardif peut relancer la lecture même après pause/stop.
- Le stop externe (`globalStatus === 'idle'`) remet l’UI à zéro mais ne force pas toujours un “hard stop” local (handlers + refs), ce qui peut laisser une lecture parasite.
- Le symptôme “boucle sur une syllabe” est cohérent avec un verset relancé en boucle par une chaîne stale/non invalidée.

Plan d’implémentation
1) Verrouiller la machine d’état audio dans `HifzStepImpregnationTajweed.tsx`
- Ajouter un helper unique de cleanup audio local (pause + clear src + null refs + reset handlers).
- Invalider systématiquement la session active (`generationRef++`) sur pause, stop, reset, next, reciter change.
- Sur reprise, rebinder les callbacks avec une nouvelle génération.

2) Durcir `playNextAyah`
- Ajouter garde stricte en tête: sortir si génération obsolète OU `!isPlayingRef.current`.
- Dans `onended` et `onerror`, vérifier à la fois génération + `isPlayingRef.current` avant d’avancer.
- Vérifier que le callback agit uniquement si l’audio courant est toujours celui attendu (anti-callback tardif).

3) Anti-boucle “syllabe bloquée”
- Ajouter une protection anti-stall au niveau d’un ayah (progression `currentTime`).
- Si le temps n’avance plus pendant une fenêtre courte, retry contrôlé (1 tentative max), puis skip au verset suivant au lieu de boucler infiniment.
- Maintenir le compteur d’écoute uniquement quand un cycle valide est terminé.

4) Synchronisation MiniPlayer ↔ composant local
- Étendre la sync globale: sur `idle` externe, faire un hard stop local complet (pas seulement état visuel).
- Synchroniser aussi le cas `paused` externe pour éviter les désynchronisations bouton local/externe.

Fichiers concernés
- `src/components/hifz/HifzStepImpregnationTajweed.tsx` (principal)
- (Optionnel si nécessaire après vérif) `src/contexts/AudioContext.tsx` pour renforcer la robustesse des transitions de status sans régression.

Validation E2E prévue
- Cas 1: lecture continue verset 1 → verset 2 (aucune répétition syllabique).
- Cas 2: pause/reprise locale au milieu du verset 2 (reprend au bon timestamp, pas de double chaîne).
- Cas 3: stop via MiniPlayer X pendant verset 2 (arrêt total immédiat, aucun son résiduel).
- Cas 4: relancer après stop et laisser tourner 3 cycles (pas d’arrêt prématuré ni boucle infinie).