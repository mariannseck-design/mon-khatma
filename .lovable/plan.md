

## Ajouter un bouton "Télécharger PDF" à l'historique de lecture

Quand la lectrice termine sa Khatma (ou à tout moment), elle pourra télécharger un PDF récapitulatif de tout son historique de lecture.

### Approche technique

On utilisera **jsPDF** (librairie légère, côté client) pour générer le PDF sans backend. Le PDF contiendra :
- Un en-tête avec le titre "Ma Khatma — Historique de lecture"
- Le nom de la lectrice (depuis `savedSetup.first_name`)
- La date de début et de fin
- Un tableau : Date | Pages lues | Sourate | Objectif atteint ✓

### Changements

1. **Installer `jspdf`** — dépendance pour la génération PDF côté client

2. **`src/components/planificateur/ReadingHistory.tsx`** :
   - Ajouter un bouton "Télécharger PDF" avec une icône `Download`
   - Nouvelle fonction `generatePDF()` qui :
     - Crée un document A4
     - Écrit l'en-tête (titre, prénom, dates)
     - Génère un tableau avec toutes les entrées (pas seulement les 15 affichées)
     - Télécharge le fichier `ma-khatma-historique.pdf`
   - Nouvelles props : `firstName?: string`, `startDate?: string`, `isKhatmaComplete?: boolean`

3. **`src/pages/PlanificateurPage.tsx`** :
   - Passer les nouvelles props à `<ReadingHistory>` : `firstName`, `startDate`, `isKhatmaComplete`

### Fichiers modifiés
- `package.json` (ajout `jspdf`)
- `src/components/planificateur/ReadingHistory.tsx`
- `src/pages/PlanificateurPage.tsx`

