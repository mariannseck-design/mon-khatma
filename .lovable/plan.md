

## Modules Hifz, Muraja'a & Mon Suivi — Plan d'implémentation en 4 sections

Ce cahier des charges est conséquent. Pour ne pas gaspiller de crédits, je propose de le diviser en **4 sections séquentielles**, chacune traitée en un seul message.

---

### SECTION 1 : Base de données + Pages squelettes + Accueil (boutons Hifz/Muraja'a)

**Base de données (migrations)** :
- Table `hifz_sessions` : id, user_id, surah_number, start_verse, end_verse, repetition_level (15/20/25/30/35/40), current_step (0-6), step_status jsonb, started_at, completed_at, created_at
- Table `hifz_memorized_verses` : id, user_id, surah_number, verse_start, verse_end, memorized_at, last_reviewed_at, sm2_interval, sm2_ease_factor, sm2_repetitions, next_review_date
- Table `muraja_sessions` : id, user_id, session_type (rabt/tour), verses_reviewed jsonb, difficulty_rating (hard/good/easy), completed_at, created_at
- Table `hifz_streaks` : id, user_id, current_streak, longest_streak, last_active_date, total_tours_completed, updated_at
- RLS : toutes les tables avec `auth.uid() = user_id`

**Pages & Routes** :
- Créer `src/pages/HifzPage.tsx` (squelette avec thème turquoise/or)
- Créer `src/pages/MurjaPage.tsx` (squelette)
- Créer `src/pages/HifzSuiviPage.tsx` (Mon Suivi)
- Ajouter les routes dans `App.tsx`

**Accueil** :
- Ajouter 2 cartes turquoise/or : "ESPACE HIFZ" et "MURAJA'A" (avec compteur doré pour Muraja'a)
- Carte "MON SUIVI" plus bas

---

### SECTION 2 : Module Hifz complet (Étapes 0 à 6)

**Écran de configuration** : Sélecteur de sourate + plage de versets + choix du niveau d'ancrage (15-40)

**Parcours guidé** (composants dans `src/components/hifz/`) :
- `HifzStep0Intention.tsx` : Affiche traduction, bouton "J'ai compris"
- `HifzStep1Revision.tsx` : Répéter 5x la veille, timer 5 min
- `HifzStep2Impregnation.tsx` : Écoute récitateur 3x (réutilise l'audio existant)
- `HifzStep3Memorisation.tsx` : Boucle de répétition avec compteur "Ancrage X/N"
- `HifzStep4Validation.tsx` : Enregistrement vocal 3 essais, texte flouté, auto-correction, pop-ups d'encouragement alternés, audio éphémère (Blob en RAM, jamais sauvé)
- `HifzStep5Liaison.tsx` : Récitation des 30 derniers jours
- `HifzStep6Tour.tsx` : Cycle 6 jours + boutons SM-2
- `HifzSuccess.tsx` : Modal de félicitations dorée

---

### SECTION 3 : Module Muraja'a

- Compteur dynamique "Prochaine Muraja'a dans HH:MM" (cercle doré, glow à 00:00, rouge rubis si +24h)
- Section Ar-Rabt (30 derniers jours)
- Section Le Tour (cycle 6 jours, algorithme SM-2)
- Messages de félicitations quotidien + cycle complet avec animation dorée
- Notification push associée
- Bouton "Commencer un nouveau cycle"

---

### SECTION 4 : Mon Suivi (Tableau de Bord)

- Message d'accueil dynamique
- 3 cartes KPI turquoise/or : Constance (streak), Versets ancrés (jauge circulaire), Tours accomplis
- Graphique en barres 7 jours (recharts, barres dorées sur fond turquoise)
- Données tirées des tables créées en Section 1

---

### Résumé technique

| Section | Fichiers créés/modifiés | DB |
|---------|------------------------|-----|
| 1 | 4 pages + App.tsx + AccueilPage + migration | 4 tables |
| 2 | ~8 composants hifz + HifzPage | - |
| 3 | ~4 composants muraja + MurjaPage | - |
| 4 | HifzSuiviPage + composants stats | - |

Chaque section = 1 message. On commence par la Section 1 si tu approuves.

