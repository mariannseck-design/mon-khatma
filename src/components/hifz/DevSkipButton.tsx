import { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface Props {
  onSkip: () => void;
  isDevMode: boolean;
}

const LONG_PRESS_MS = 1500;

export default function DevSkipButton({ onSkip, isDevMode }: Props) {
  const [showDialog, setShowDialog] = useState(false);
  const [pressing, setPressing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startPress = useCallback(() => {
    setPressing(true);
    timerRef.current = setTimeout(() => {
      setPressing(false);
      setShowDialog(true);
    }, LONG_PRESS_MS);
  }, []);

  const cancelPress = useCallback(() => {
    setPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const confirmSkip = () => {
    console.log('[DevSkip] ✅ Skip confirmé via dialog');
    setShowDialog(false);
    onSkip();
  };

  if (!isDevMode) return null;

  return (
    <>
      <button
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onTouchCancel={cancelPress}
        onMouseDown={startPress}
        onMouseUp={cancelPress}
        onMouseLeave={cancelPress}
        className="fixed bottom-4 right-4 z-[9999] px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all select-none"
        style={{
          background: pressing ? 'rgba(220,50,50,0.85)' : 'rgba(212,175,55,0.85)',
          color: pressing ? '#fff' : '#1a2e1a',
          border: `2px solid ${pressing ? 'rgba(220,50,50,0.6)' : 'rgba(212,175,55,0.6)'}`,
          transform: pressing ? 'scale(0.95)' : 'scale(1)',
        }}
      >
        {pressing ? '⏳ Maintenir...' : '⏩ Skip (appui long)'}
      </button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent
          className="rounded-2xl max-w-[320px]"
          style={{
            background: '#1a2e1a',
            border: '2px solid rgba(212,175,55,0.4)',
            color: '#f0e6c8',
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: '#d4af37' }}>⚠️ Confirmer le saut</DialogTitle>
            <DialogDescription style={{ color: 'rgba(240,230,200,0.7)' }}>
              Es-tu sûre de vouloir sauter cette étape ? Cette action est réservée au mode testeur.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-3 mt-4">
            <button
              onClick={() => setShowDialog(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(240,230,200,0.8)', border: '1px solid rgba(240,230,200,0.2)' }}
            >
              Annuler
            </button>
            <button
              onClick={confirmSkip}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #d4af37, #c9a030)', color: '#1a2e1a' }}
            >
              Confirmer ⏩
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
