

## Nettoyage et simplification UI — Page Muraja'a

### 1. Supprimer le bloc "Mes ancrages en cours" + Fusionner dans Ar-Rabt
**Lignes 379-423** : Supprimer entièrement la section "Mes ancrages en cours (La Liaison)". Intégrer la barre de progression "Jour X/30" directement dans chaque item de la checklist Ar-Rabt via le composant `MurajaChecklist`.

**`src/components/muraja/MurajaChecklist.tsx`** : Pour `section === 'rabt'`, ajouter sous chaque item une mini barre de progression (track `#E6F0ED`, fill `#065F46`) avec le texte "Jour X / 30". Passer `liaison_start_date` dans les props des items.

### 2. Supprimer les paragraphes explicatifs, garder uniquement l'icône info
**Lignes 364-370** (paragraphe Ar-Rabt) : Supprimer.
**Lignes 442-447** (paragraphe SM-2) : Supprimer.
Les `MurajaMethodModal` (icône info) restent en place — ce sont eux qui affichent les définitions au clic.

**Remplacer l'icône Info** dans `MurajaMethodModal.tsx` par `Lamp` (lucide-react), couleur `#D4AF37`. Fond du `DialogContent` : `#065F46`, texte blanc.

### 3. Humanisation des dates et textes
**Progression du jour (lignes 328-330)** : Remplacer `{checkedCount}/{totalBlocks} blocs` par :
- Tout coché : "Bravo, tu as tout révisé !"
- Partiellement : "Plus que X étape(s) !"
- 0 : "C'est parti !"

**Section Le Tour (ligne 432)** : Renommer en "Le Tour — Révision intelligente" (supprimer "SM-2").

**Sous-titre Ar-Rabt (lignes 357-363)** : Simplifier en "Récitation quotidienne".

**Checklist Tour** : Remplacer `· {interval}j` par texte humain ("À réviser aujourd'hui", "Prévu demain", "Dans X jours").

**Mon trésor (lignes 495-498)** : Remplacer la date brute par "Ancré le {date}" avec icône calendrier.

### 4. Design — Espacement et bordures fines
Augmenter `space-y-3` → `space-y-4` sur les sections. Padding cartes `px-4 py-4`. Bordures fines via `border: '1px solid var(--p-border)'`.

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `src/pages/MurjaPage.tsx` | Supprimer section "Mes ancrages", supprimer paragraphes, humaniser textes, aérer |
| `src/components/muraja/MurajaChecklist.tsx` | Ajouter barre Jour X/30 sous items rabt, humaniser intervalle tour |
| `src/components/muraja/MurajaMethodModal.tsx` | Icône Lamp dorée, fond DialogContent émeraude + texte blanc |

