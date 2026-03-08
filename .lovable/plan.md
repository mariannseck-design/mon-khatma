

## Ajouter un bouton favori dans DhikrSession pour sauvegarder des invocations

### Probleme
Les sessions Dhikr n'ont pas de bouton favori. Le systeme `useDouaFavorites` existe deja (localStorage) mais n'est connecte qu'a la page Douas. Il faut l'integrer dans `DhikrSession` pour que chaque invocation puisse etre sauvegardee en favori.

### Changements

**`src/components/dhikr/DhikrSession.tsx`** :
- Importer `Heart` de lucide-react, `useDouaFavorites` et `makeDouaId`
- Accepter une nouvelle prop `categoryId: string` pour construire l'ID unique du favori
- Ajouter un bouton coeur dans le header (a cote des controles de taille arabe)
- Au clic, appeler `toggleFavorite(id, categoryTitle, '', item)` avec l'item courant
- Le coeur se remplit (fill) si l'invocation est deja en favori

**`src/pages/DhikrPage.tsx`** :
- Passer `categoryId={activeCategory}` a `<DhikrSession>`

**`src/pages/EmotionsPage.tsx`** :
- Meme chose : passer le `categoryId` correspondant aux sessions Dhikr lancees depuis cette page

Un bouton, trois fichiers touches.

