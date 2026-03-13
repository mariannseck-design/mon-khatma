
Objectif: corriger définitivement le fait que la phase **Mémorisation** ne s’affiche pas, sans toucher au sujet Skip (comme tu l’as précisé).

Plan d’implémentation:

1) Rendre la transition Compréhension → Mémorisation explicite (plus d’auto-saut)
- Fichier: `src/components/hifz/istiqamah/StepComprehension.tsx`
- Remplacer l’auto `setTimeout(onNext, 1800)` par une transition en 2 temps:
  - clic 1: validation de compréhension (message OK),
  - clic 2: bouton explicite **“Commencer la mémorisation”**.
- Résultat: impossible de “rater visuellement” la Mémorisation à cause d’un enchaînement automatique.

2) Verrouiller la machine d’état pour interdire Tikrar tant que Mémorisation n’est pas validée
- Fichier: `src/components/hifz/istiqamah/useIstiqamahState.ts`
- Ajouter une garde de progression stricte:
  - `comprehension` peut mener uniquement à `immersion`,
  - `immersion` peut mener uniquement à `tikrar`,
  - toute transition incohérente est ignorée.
- Ajouter un drapeau interne “immersion_completed” pour empêcher l’affichage de Tikrar tant que l’étape immersion n’a pas réellement été terminée.
- Résultat: même en cas d’événement concurrent, Tikrar ne peut plus apparaître avant Mémorisation.

3) Ajouter une barrière de rendu côté moteur (défense en profondeur)
- Fichier: `src/components/hifz/istiqamah/IstiqamahEngine.tsx`
- Si l’état courant tente d’afficher `tikrar` sans preuve de completion de `immersion`, forcer le rendu de `StepImmersion`.
- Résultat: sécurité supplémentaire côté UI, même si une transition inattendue se produit.

4) Instrumenter pour diagnostiquer précisément et éviter de te faire perdre du temps/crédits
- Fichier: `src/pages/HifzPage.tsx` (mise à jour `step_status` existant)
- Enregistrer dans `step_status` des marqueurs de sous-étapes Istiqâmah:
  - `istiqamah_entered_at`
  - `comprehension_confirmed_at`
  - `immersion_started_at`
  - `immersion_completed_at`
  - `tikrar_started_at`
- Résultat: si souci persistant, on voit immédiatement où ça casse sans refaire 10 essais.

5) Vérification ciblée (acceptance)
- Cas A: Compréhension validée → bouton “Commencer la mémorisation” visible → Mémorisation affichée.
- Cas B: taps rapides / répétés sur Compréhension: jamais de saut direct vers Tikrar.
- Cas C: Tikrar n’apparaît qu’après completion réelle de Mémorisation.
- Cas D: session step 3 chronométrée > quelques secondes (plus de “passage éclair” anormal).

Section technique (résumé):
- Problème traité comme un bug de transition non déterministe + perception UX liée à l’auto-avancement.
- Correctif en 3 couches:
  1) UX explicite (plus d’auto-next),
  2) machine d’état stricte (transitions autorisées uniquement),
  3) garde de rendu anti-incohérence.
- Observabilité ajoutée pour diagnostiquer vite si une régression réapparaît.
