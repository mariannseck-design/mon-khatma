

# Corrections du Rapport Hebdomadaire et de la Landing Page

## 3 problemes identifies

### 1. Le rapport hebdomadaire s'affiche le mauvais jour avec le mauvais texte

**Actuellement** : Le rapport s'affiche le dimanche et dit "Cette semaine".
**Correction** : Le rapport doit s'afficher le **lundi** (premier jour de la nouvelle semaine) et dire **"la semaine derniere"** en faisant reference aux donnees de la semaine precedente (lundi a dimanche).

### 2. Les donnees de la semaine sont mal calculees

**Actuellement** : La fonction `getWeekStart` utilise le dimanche comme debut de semaine. Le rapport montre les pages lues depuis dimanche (donc seulement aujourd'hui = 45 pages).
**Correction** : Utiliser **lundi** comme debut de semaine. Le lundi, le rapport regardera les donnees de lundi dernier a dimanche (hier), soit une semaine complete.

### 3. Les videos d'installation sont trop hautes sur la landing page

**Actuellement** : Les videos sont placees juste apres le logo/hero, avant les fonctionnalites.
**Correction** : Deplacer le bloc video **en bas de la page**, apres la citation et avant le footer.

---

## Details techniques

### Fichier `src/components/ramadan/RamadanWeeklyReport.tsx`

- Changer `getWeekStart` pour calculer le lundi comme debut de semaine au lieu du dimanche
- Changer la condition `isSunday` en `isMonday` (jour = 1)
- Quand c'est lundi, chercher les donnees de la **semaine precedente** (lundi dernier a dimanche)
- Changer le texte "Cette semaine" en "La semaine derniere"

### Fichier `src/pages/LandingPage.tsx`

- Deplacer le bloc video d'installation iPhone (lignes 64-113) apres la citation (ligne 215), juste avant la fermeture du composant

