

## Plan : Protéger la page Dhikr avec ComingSoonGate (admin only)

### Changement unique dans `src/App.tsx`

Envelopper la route `/dhikr` avec `ComingSoonGate`, comme c'est déjà fait pour Hifz, Muraja'a et Suivi.

**Ligne 90 actuelle :**
```tsx
<Route path="/dhikr" element={<ProtectedRoute><DhikrPage /></ProtectedRoute>} />
```

**Devient :**
```tsx
<Route path="/dhikr" element={
  <ProtectedRoute>
    <ComingSoonGate title="Dhikr & Adhkâr" icon={BookOpenCheck} description="Accède à tes adhkâr du matin, du soir et invocations quotidiennes avec un compteur interactif.">
      <DhikrPage />
    </ComingSoonGate>
  </ProtectedRoute>
} />
```

Seuls les admins verront le module interactif. Les autres verront l'écran élégant "Bientôt disponible".

### Fichier modifié
- `src/App.tsx` (1 ligne)

