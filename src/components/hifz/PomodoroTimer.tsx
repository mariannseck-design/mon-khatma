import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type TimerStatus = 'idle' | 'focus' | 'paused' | 'break';

const BREAK_DURATION = 5 * 60; // 5 minutes

export default function PomodoroTimer() {
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [focusDuration, setFocusDuration] = useState(25 * 60);
  const [showDialog, setShowDialog] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [notification, setNotification] = useState<'focus-done' | 'break-done' | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const vibrateGently = () => {
    try { navigator.vibrate?.(30); } catch {}
  };

  // Tick
  useEffect(() => {
    if (status === 'focus' || status === 'break') {
      clearTimer();
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearTimer();
            vibrateGently();
            if (status === 'focus') {
              setNotification('focus-done');
              setStatus('paused');
            } else {
              setNotification('break-done');
              setStatus('idle');
              // auto-dismiss after 5s
              setTimeout(() => setNotification(prev => prev === 'break-done' ? null : prev), 5000);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return clearTimer;
  }, [status, clearTimer]);

  const startFocus = (seconds: number) => {
    setFocusDuration(seconds);
    setTimeLeft(seconds);
    setStatus('focus');
    setShowDialog(false);
    setShowCustom(false);
    setNotification(null);
  };

  const startBreak = () => {
    setTimeLeft(BREAK_DURATION);
    setStatus('break');
    setNotification(null);
  };

  const togglePause = () => {
    if (status === 'focus') setStatus('paused');
    else if (status === 'paused' && timeLeft > 0) setStatus('focus');
  };

  const reset = () => {
    clearTimer();
    setStatus('idle');
    setTimeLeft(0);
    setNotification(null);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const isActive = status !== 'idle';
  const isBreak = status === 'break';

  return (
    <div className="space-y-2">
      {/* Timer bar */}
      <div
        className="flex items-center justify-center gap-3 rounded-xl px-4 py-2 cursor-pointer select-none"
        style={{
          background: isBreak
            ? 'rgba(46,125,50,0.12)'
            : 'rgba(212,175,55,0.08)',
          border: `1px solid ${isBreak ? 'rgba(46,125,50,0.3)' : 'rgba(212,175,55,0.2)'}`,
        }}
        onClick={!isActive ? () => setShowDialog(true) : undefined}
      >
        <Timer className="h-4 w-4" style={{ color: isBreak ? '#4CAF50' : '#d4af37', opacity: 0.7 }} />

        {!isActive ? (
          <span className="text-xs font-medium" style={{ color: 'rgba(212,175,55,0.6)' }}>
            Minuteur Pomodoro
          </span>
        ) : (
          <>
            <span className="text-sm font-bold tabular-nums" style={{ color: isBreak ? '#4CAF50' : '#d4af37' }}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {isBreak ? 'Pause' : 'Focus'}
            </span>
            <div className="flex items-center gap-1 ml-1">
              {!isBreak && (
                <button
                  onClick={(e) => { e.stopPropagation(); togglePause(); }}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  {status === 'paused' ? (
                    <Play className="h-3.5 w-3.5" style={{ color: '#d4af37' }} />
                  ) : (
                    <Pause className="h-3.5 w-3.5" style={{ color: '#d4af37' }} />
                  )}
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="p-1.5 rounded-lg transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <RotateCcw className="h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Notification banners */}
      <AnimatePresence>
        {notification === 'focus-done' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-2 rounded-xl px-4 py-2.5"
            style={{ background: 'rgba(46,125,50,0.15)', border: '1px solid rgba(46,125,50,0.3)' }}
          >
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4" style={{ color: '#4CAF50' }} />
              <span className="text-xs font-medium" style={{ color: '#a5d6a7' }}>
                Bravo ! Prenez une pause bien méritée.
              </span>
            </div>
            <button
              onClick={startBreak}
              className="px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap"
              style={{ background: 'rgba(46,125,50,0.3)', color: '#4CAF50', border: '1px solid rgba(46,125,50,0.4)' }}
            >
              Pause 5 min
            </button>
          </motion.div>
        )}
        {notification === 'break-done' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 cursor-pointer"
            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}
            onClick={() => setNotification(null)}
          >
            <span className="text-xs font-medium" style={{ color: '#d4af37' }}>
              ✨ Pause terminée, on reprend ! Bismillah
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Setup dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent
          className="max-w-sm rounded-2xl border-0"
          style={{ background: '#1a2e1a', border: '1px solid rgba(212,175,55,0.2)' }}
        >
          <DialogHeader>
            <DialogTitle className="text-center text-sm font-bold" style={{ color: '#f0e6c8', fontFamily: "'Playfair Display', serif" }}>
              ⏱ Minuteur Pomodoro
            </DialogTitle>
            <DialogDescription className="text-center text-xs leading-relaxed pt-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Il est recommandé de prendre une pause de 5 minutes toutes les 25 minutes de concentration. Confirmez-vous ce rythme ou souhaitez-vous choisir votre temps de concentration ?
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => startFocus(25 * 60)}
              className="w-full rounded-xl py-3 text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #d4af37, #b8962e)', color: '#1a2e1a' }}
            >
              Confirmer (25 min)
            </button>

            {!showCustom ? (
              <button
                onClick={() => setShowCustom(true)}
                className="w-full rounded-xl py-2.5 text-xs font-medium"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Personnaliser
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Select onValueChange={(v) => startFocus(parseInt(v) * 60)}>
                  <SelectTrigger
                    className="flex-1 h-10 rounded-xl border-0 text-xs"
                    style={{ background: 'rgba(255,255,255,0.08)', color: '#f0e6c8' }}
                  >
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent
                    className="rounded-xl border-0"
                    style={{ background: '#1a2e1a', border: '1px solid rgba(212,175,55,0.2)' }}
                  >
                    {[15, 30, 45, 60].map(m => (
                      <SelectItem key={m} value={String(m)} className="text-xs" style={{ color: '#f0e6c8' }}>
                        {m} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
