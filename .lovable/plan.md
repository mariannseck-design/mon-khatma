

## Plan : Refonte de la page de connexion "Soft UI"

### Objectif

Redesign complet de `AuthPage.tsx` avec une esthetique Soft UI minimaliste et apaisante, tout en conservant la logique d'authentification existante (login, signup, forgot-password, check-email, cooldown, validation).

### Changements

**`src/pages/AuthPage.tsx`** -- Refonte visuelle uniquement, logique inchangee

1. **Fond** : Remplacer `bg-gradient-warm` par un fond blanc casse avec un subtil degrade vers vert sauge pale (`bg-gradient-to-b from-[#FDFBF7] to-[#F0F5F2]`)

2. **En-tete enrichi** :
   - Logo existant (logo.png) avec un cadre dore doux (border doree, shadow)
   - Titre "Ma Khatma" en serif (font-display deja configure = Playfair Display)
   - Ajout du slogan : "Cheminez vers une lecture et une memorisation constantes, par la grace d'Allah (عز وجل)."

3. **Formulaire Soft UI** :
   - Inputs avec fond legerement teinte (`bg-[#F5F7F6]`), bordures subtiles, ombres internes douces
   - Bouton "Se connecter" vert menthe doux, grande taille, coins arrondis
   - Ajout toggle afficher/masquer mot de passe (icone Eye/EyeOff)

4. **Section "Apercu des fonctionnalites"** (visible uniquement en mode login) :
   - 3 petites cartes horizontales fines sous le formulaire avec icones :
     - BookOpen : "Ma Khatma" / "Suivi de lecture"
     - Brain : "Istiqamah" / "Memorisation"
     - Heart : "Duas" / "Invocations quotidiennes"

5. **Pied de page** :
   - Lien "Pas encore de compte ? S'inscrire" (deja present)
   - Remplacer la citation actuelle par : "Le saviez-vous ? Le terme Istiqamah evoque la perseverance. C'est la cle d'une memorisation reussie."

### Ce qui ne change PAS
- Toute la logique auth (handleSubmit, handleResend, handleForgotPassword, cooldown, translateAuthError)
- Les sous-composants CheckEmailView et ForgotPasswordForm (ajustements de style uniquement)
- Le flux signup avec prenom, validation, confirmation email

