
Objectif: arrêter définitivement le saut Compréhension → (Validation/Tikrar) et forcer l’affichage réel de Mémorisation.

Constat confirmé (à partir de tes réponses + traces):
- Tu observes un “saut d’étape”.
- Le mode testeur + bouton ⏩ Skip sont visibles.
- Les durées enregistrées sur l’étape Istiqâmah sont parfois ~1s, ce qui correspond à un contournement de l’étape, pas à un parcours normal.

Plan d’implémentation (court et ciblé):

1) Sécuriser le bouton Skip pour éviter tout déclenchement involontaire
- Fichier: `src/components/hifz/DevSkipButton.tsx`
- Remplacer le double-tap actuel par un appui long (ex: 1.2–1.5s) + confirmation explicite.
- Conserver le Skip pour le mode testeur, mais supprimer les activations accidentelles.

2) Neutraliser Skip pendant l’étape Istiqâmah
- Fichier: `src/pages/HifzPage.tsx`
- Masquer temporairement le bouton Skip quand `step === 3` (Istiqâmah).
- Résultat: impossible de sortir de Compréhension/Mémorisation par erreur pendant le tunnel interne.

3) Tracer la source de transition (normal vs skip)
- Fichier: `src/pages/HifzPage.tsx`
- Enrichir `step_status` avec un marqueur de source (`transition_source`) lors des changements d’étape.
- But: distinguer immédiatement un saut manuel d’une transition normale.

4) Renforcer le diagnostic côté Istiqâmah
- Fichiers: `src/components/hifz/istiqamah/StepComprehension.tsx`, `src/components/hifz/istiqamah/IstiqamahEngine.tsx`
- Garder temporairement les logs existants + ajouter un log explicite si sortie d’Istiqâmah sans passage visible par immersion.
- Retirer ces logs après validation finale.

5) Validation de correction (mobile 360x627)
- Cas A: Compréhension → clic “J’ai compris” → clic “Commencer la mémorisation” → Mémorisation affichée.
- Cas B: taps rapides près du bas d’écran → aucun saut d’étape.
- Cas C: Tikrar n’apparaît qu’après fin de Mémorisation.
- Cas D: historique de session montre une durée cohérente de l’étape Istiqâmah (plus de “1 seconde”).

Détails techniques (résumé):
- Le moteur Istiqâmah est déjà linéaire et protégé; le point faible restant est l’interaction UI du mode testeur pendant cette étape.
- Le correctif principal est donc UX/interaction (anti-misclick), pas la machine d’état.
- On garde le mode testeur, mais on le rend sûr pour ne plus consommer de tentatives/crédits inutilement.
