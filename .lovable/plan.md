

## Supprimer le doublon sur la page Accueil

### Problème

À partir de la ligne 547, tout le contenu est dupliqué : Ma Khatma, Versets favoris, Nos Défis, Espace Communauté, Weekly Report, Citation spirituelle, PWA Install, et Partager — tous apparaissent deux fois.

### Correction

**`src/pages/AccueilPage.tsx`** — Supprimer les lignes 547 à 724 (le second bloc dupliqué qui commence par la carte Ma Khatma et se termine par le bouton Partager). Le premier bloc (lignes ~392-546) reste intact.

