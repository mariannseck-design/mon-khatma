

## Audit du module Dhikr — Observations et améliorations proposées

### Ce qui fonctionne bien
- Architecture solide : DhikrPage → DhikrSession → DhikrCounter, bien découplée
- Compteur interactif avec retour haptique, cercle de progression, auto-avance
- 10 catégories bien organisées avec intros détaillées pour Istikharah/Omra/Hajj
- Contrôle de taille du texte arabe avec persistance localStorage
- Navigation par swipe et dots indicators

### Problèmes identifiés

**1. Toutes les cartes sont `enabled: false`**
Les 10 cartes ont `enabled: false`, ce qui signifie que seuls les admins peuvent y accéder. Les utilisateurs normaux voient "Bientôt disponible" sur TOUTES les cartes — la page est donc **complètement inutilisable** pour eux. Il faut activer les cartes prêtes.

**2. Titre "Mon Dhikr Quotidien" dupliqué**
Le `AppLayout` affiche déjà le titre "Mon Dhikr Quotidien" dans le header, et il est affiché une seconde fois en `<h1>` dans le contenu de la grille (ligne 143-148). Doublon inutile.

**3. Pas de persistance du compteur entre sessions**
Les compteurs de DhikrCounter se réinitialisent à chaque visite. Si l'utilisateur quitte en plein milieu, tout est perdu. Aucun save localStorage ou base de données.

### Améliorations proposées

| # | Changement | Fichier |
|---|-----------|---------|
| 1 | **Activer toutes les cartes** : passer `enabled: true` sur les 10 cartes | `DhikrPage.tsx` |
| 2 | **Supprimer le titre dupliqué** `<h1>Mon Dhikr Quotidien</h1>` | `DhikrPage.tsx` |
| 3 | **Sauvegarder la progression** de chaque session en localStorage (index courant + compteurs) pour reprendre où on en était | `DhikrSession.tsx` |

### Détails techniques

**Activation des cartes** : Simplement changer `enabled: false` → `enabled: true` pour les 10 entrées du tableau `dhikrCards`.

**Suppression du doublon** : Retirer le bloc `<h1>` (lignes 143-148) puisque `AppLayout` gère déjà le titre.

**Persistance session** : Dans `DhikrSession`, sauver `currentIndex` dans localStorage avec une clé basée sur le titre de la catégorie. Au montage, restaurer l'index sauvegardé. Réinitialiser quand la session est terminée.

