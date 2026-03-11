

## Module "Méthode Oustaz Mourad"

### Vue d'ensemble

Un nouveau parcours lineaire de memorisation en 4 phases hebdomadaires, accessible via `/methode-mourad`. Chaque phase doit etre validee pour debloquer la suivante. Design : fond creme `#FDF8F0`, cartes blanches arrondies, accents vert emeraude `#059669`.

### Architecture

```text
Route: /methode-mourad
  └─ MéthodeMouradPage.tsx (orchestrateur principal)
       ├─ MouradConfig.tsx        (choix sourate/versets + lancement)
       ├─ MouradPhase1.tsx        (Dimanche matin — Compréhension)
       ├─ MouradPhase2.tsx        (Dim soir → Vendredi — Imprégnation)
       ├─ MouradPhase3.tsx        (Samedi — Mémorisation & Liaison)
       ├─ MouradPhase4.tsx        (Samedi → Dimanche — Ancrage 40)
       ├─ MouradMaintenance.tsx   (30 jours post-ancrage)
       └─ MouradSuccess.tsx       (transition vers ANKI)
```

### Base de donnees (1 migration)

**Table `mourad_sessions`** :
- `id`, `user_id`, `surah_number`, `verse_start`, `verse_end`
- `current_phase` (1-4), `phase_status` (jsonb — details par phase)
- `listen_count` (phase 2), `repetition_40_count` (phase 4)
- `maintenance_day` (0-30), `maintenance_start_date`
- `reciter_id`, `started_at`, `completed_at`, `created_at`
- RLS : CRUD pour l'utilisateur authentifie sur ses propres lignes

### Details par phase

**Phase 1 — Comprehension (Dimanche matin)**
- Affiche Tafsir (via API ou texte statique) + traduction francaise
- Toggle Mushaf (reutilise `HifzMushafToggle` adapte au theme clair)
- Bouton "J'ai compris le sens des versets" → deverrouille phase 2

**Phase 2 — Impregnation & Ecoute (Dim soir → Vendredi)**
- Selecteur de recitateur (reutilise `RECITERS` de `useQuranAudio`)
- Dimanche soir : 5 ecoutes obligatoires avec compteur
- Lundi-Vendredi : ecoute + lecture simultanee (Mushaf affiche)
- Compteur d'ecoutes persiste en DB (`listen_count`)
- Bouton validation apres les 5 ecoutes min

**Phase 3 — Memorisation & Liaison (Samedi matin)**
- Sous-phase A : 5 ecoutes + cours, puis desactivation auto de l'audio
- Sous-phase B : Repetition interactive sans audio
  - Par verset : Lire 3x → Reciter de memoire 3x (compteurs visuels)
  - Cumul : Enchainement 3x lecture → 3x memoire
- Validation : 3 enregistrements audio sans erreur (reutilise `useVoiceRecorder`)
  - Erreur a la 2e tentative → reset a 0

**Phase 4 — Ancrage des 40 (Samedi → Dimanche)**
- Objectif : 40 recitations de memoire (Mushaf ferme)
- Input numerique : l'utilisatrice saisit le nombre fait
- Affichage dynamique : "Bravo ! Plus que X fois avant l'ancrage final"
- Barre de progression visuelle 0/40
- Validation a 40 → lance la maintenance

**Maintenance (30 jours)**
- 1 recitation/jour, compteur jour par jour
- Au 31e jour : bascule automatique vers le module Muraja'a existant (SM-2)
- Enregistrement dans `hifz_memorized_verses` avec `liaison_start_date`

### Composants reutilises

- `HifzMushafToggle` (adapte couleurs creme/emeraude)
- `HifzMushafImage` (zoom + double-tap)
- `QuranTextView` (mode texte)
- `useQuranAudio` / `RECITERS` (audio)
- `useVoiceRecorder` (enregistrement phase 3)
- `AppLayout` (structure page)

### Route & Navigation

- Ajout route `/methode-mourad` dans `App.tsx` (protegee)
- Lien d'acces depuis la page d'accueil ou le menu

### Fichiers a creer (~10)

1. `src/pages/MethodeMouradPage.tsx`
2. `src/components/mourad/MouradConfig.tsx`
3. `src/components/mourad/MouradPhase1.tsx`
4. `src/components/mourad/MouradPhase2.tsx`
5. `src/components/mourad/MouradPhase3.tsx`
6. `src/components/mourad/MouradPhase4.tsx`
7. `src/components/mourad/MouradMaintenance.tsx`
8. `src/components/mourad/MouradSuccess.tsx`
9. `src/components/mourad/MouradMushafToggle.tsx` (version theme clair)
10. `src/components/mourad/MouradPhysicalView.tsx` (affichage references versets)

### Design System

- Fond page : `#FDF8F0` (creme)
- Cartes : `bg-white rounded-3xl shadow-sm border border-gray-100`
- Accent principal : `#059669` (emeraude)
- Accent secondaire : `#10B981`
- Texte : `text-gray-800` / `text-gray-500`
- Boutons : gradient emeraude, coins arrondis `rounded-2xl`

