

## Fix: Single Tap Recording

### Problem
The record button requires a double tap on mobile due to Framer Motion's `whileTap` + `onClick` interaction causing event conflicts on touch devices.

### Solution — 1 file modified

**`src/components/hifz/HifzStep4Validation.tsx`** (line ~292-313):
- Replace `onClick` with `onPointerDown` on the record button for immediate single-tap response
- Add `touch-action: manipulation` CSS to prevent browser double-tap-to-zoom delay
- Keep `whileTap` for visual feedback but decouple it from the action trigger

