

## Plan : Icônes & badges colorés pour la page Muraja'a

Appliquer le même style de badges gradient que sur le Suivi Hifz aux icônes de la page Muraja'a.

### Changements dans `src/pages/MurjaPage.tsx`

1. **Icône header** (ligne 276-284) : Remplacer le fond plat par un gradient émeraude `linear-gradient(135deg, #065F46, #10B981)` + icône blanche + boxShadow

2. **Icône Ar-Rabt** (ligne 351) : Envelopper `Link` dans un cercle `w-7 h-7 rounded-full` avec gradient doré `linear-gradient(135deg, #B8960C, #D4AF37)` + icône blanche

3. **Badge count Ar-Rabt** (ligne 356-358) : Ajouter un fond gradient émeraude au badge count au lieu du fond plat

4. **Icône Muraja'a** (ligne 375) : Envelopper `BookOpen` dans un cercle `w-7 h-7 rounded-full` avec gradient émeraude `linear-gradient(135deg, #065F46, #10B981)` + icône blanche

5. **Badge count Muraja'a** (ligne 380) : Même style gradient que le badge Ar-Rabt

6. **Icône Mes Escaliers** (ligne 429) : Envelopper `TrendingUp` dans un cercle `w-7 h-7 rounded-full` avec gradient violet `linear-gradient(135deg, #6D28D9, #8B5CF6)` + icône blanche

