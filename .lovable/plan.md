

## Plan : Ajouter un bandeau d'information sur la page de connexion

Ajouter un message d'excuse/explication en haut du formulaire de connexion pour informer les utilisatrices qu'elles doivent se réinscrire suite à la migration.

### Changement

**Fichier : `src/pages/AuthPage.tsx`**

Ajouter un bandeau d'information (Alert) juste au-dessus de la Card du formulaire, visible uniquement en mode `login` et `signup`. Le message expliquera de manière bienveillante :
- Que l'application a été mise à jour / migrée vers une nouvelle infrastructure
- Qu'il faut se réinscrire avec le même email
- S'excuser pour le désagrément

Le bandeau utilisera le composant `Alert` existant avec une icône d'information, stylé en accord avec le thème vert/doré de l'app. Il sera discret mais visible (fond léger, bordure douce).

