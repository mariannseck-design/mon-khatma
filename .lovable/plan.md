

## Plan : Ajout du bouton Support WhatsApp

### Constat

La refonte Soft UI est deja implementee dans `AuthPage.tsx` (fond degrade, cadre dore, cartes fonctionnalites, toggle mot de passe, slogan, citation Istiqamah). Le seul ajout manquant est le bouton support WhatsApp.

### Changement

**`src/pages/AuthPage.tsx`** :
- Ajouter un bouton/lien discret "Besoin d'aide ? Contacte-nous" en bas de page, avant ou apres la citation Istiqamah
- Lien vers `https://wa.me/33785263862` (format international WhatsApp)
- Icone MessageCircle de Lucide, style discret (text-muted-foreground, petit texte)
- Ouvre dans un nouvel onglet (`target="_blank"`)

