

## Fix: Dhikr categories blocked by "Bientôt disponible"

### Problem
When you tap a dhikr card (e.g. "Après la prière") on the hub page (`/emotions`), it navigates to `/dhikr?category=prayer`. But the `/dhikr` route is wrapped in `ComingSoonGate`, which blocks all non-admin users with a "Bientôt disponible" screen.

### Solution
Remove the `ComingSoonGate` wrapper from the `/dhikr` route in `App.tsx`. The DhikrPage already handles its own access control internally (each card has an `enabled` flag + admin check).

### File changed
- **`src/App.tsx`** (line ~93): Change the `/dhikr` route from:
  ```
  <ComingSoonGate ...>{<DhikrPage />}</ComingSoonGate>
  ```
  to just:
  ```
  <DhikrPage />
  ```

This will allow all authenticated users to access the dhikr categories that are marked `enabled: true` in the EmotionsPage (matin, soir, prière, chifâ, louanges), while DhikrPage's own `enabled` flags + admin check still gate the "coming soon" cards.

