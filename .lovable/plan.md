

## Plan : Autoriser le zoom par pincement (pinch-to-zoom) sur toute l'application

### Problème
La balise `meta viewport` dans `index.html` (ligne 5) contient `maximum-scale=1.0, user-scalable=no`, ce qui bloque totalement le zoom natif du navigateur sur mobile.

### Solution
Modifier la balise viewport pour autoriser le zoom :

**`index.html`** ligne 5 :
- Remplacer `maximum-scale=1.0, user-scalable=no` par `maximum-scale=5.0, user-scalable=yes`
- Cela autorise le pinch-to-zoom natif jusqu'à 5x sur toutes les pages (Hifz steps, Suivi, etc.)

### Note
Le contrôle de taille "Aa" (ZoomControl) reste disponible en complément. Le zoom natif par pincement et le contrôle de taille sont deux mécanismes indépendants et complémentaires. Sur iOS, les inputs à `font-size: 16px` empêchent déjà le zoom automatique au focus — pas de conflit.

