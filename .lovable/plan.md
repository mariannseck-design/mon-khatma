

## Uniformiser les titres Hifz sur la page d'accueil

### Changements sur `src/pages/AccueilPage.tsx`

**Zone 1 — Méthode Tikrar-Istiqâmah (ligne ~421)**
- Réduire la taille : `text-xl` → `text-base`
- Ajouter un petit "1" en exposant à côté : `Méthode Tikrar-ISTIQÂMAH¹`
- Mettre "ISTIQÂMAH" en majuscules (déjà uppercase via la classe, mais écrire le texte correctement)

**Zone 2 — Méthode Oustaz Mourad (ligne ~448-452)**
- Appliquer exactement les mêmes classes que Zone 1 : `text-base font-bold tracking-[0.08em] uppercase`
- Texte : `Méthode Oustaz Mourad`

Résultat : les deux titres auront la même taille (`text-base`), le même style (bold, uppercase, tracking), et Zone 1 aura un petit "¹" en exposant.

