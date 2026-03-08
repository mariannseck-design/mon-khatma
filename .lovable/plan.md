

## Ajouter les vertus (fadl) aux dhikr principaux

### Scope

On ajoute un champ `fadl` uniquement aux dhikr qui ont une vertu specifique mentionnee dans les hadiths. Estimation : environ 60-80 items sur les 410 (ceux dont le hadith mentionne explicitement une recompense ou un merite).

### Changements

**1. `src/components/dhikr/DhikrCounter.tsx`**
- Ajouter `fadl?: string` au type `DhikrItem`
- Afficher le fadl sous la source avec une icone etoile (✨), style discret en `text-[11px]` italic

**2. `src/lib/adhkarData.ts`**
- Ajouter le champ `fadl` aux items concernes dans les 10 categories. Exemples :
  - Ayat al-Kursi : "Celui qui la recite le matin est protege jusqu'au soir" (Al-Hakim)
  - Sayyid al-Istighfar : "Celui qui le recite avec certitude le matin et meurt dans la journee sera parmi les gens du Paradis" (Al-Bukhari)
  - SubhanAllah x33 / Alhamdulillah x33 / Allahu Akbar x34 : "Celui qui les dit apres chaque priere, ses peches seront pardonnes meme s'ils sont comme l'ecume de la mer" (Muslim)
  - Les 3 Qul (Ikhlas, Falaq, Nas) : "Te suffisent contre toute chose" (Abu Dawud)

Cela necessitera 3-4 messages pour couvrir toutes les categories, en commencant par Matin et Soir.

### Temps estime
- Code (type + affichage) : 1 message
- Donnees (fadl sur ~70 items en 10 categories) : 3-4 messages

