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

const BREAK_DURATION = 5 * 60;
const SS_STATUS = 'pomodoro_status';
const SS_END = 'pomodoro_endTimestamp';
const SS_TIMELEFT = 'pomodoro_timeLeft';
const SS_DURATION = 'pomodoro_focusDuration';

function readStorage(): { status: TimerStatus; endTimestamp: number; timeLeft: number; focusDuration: number } {
  const status = (sessionStorage.getItem(SS_STATUS) as TimerStatus) || 'idle';
  const endTimestamp = Number(sessionStorage.getItem(SS_END) || 0);
  const timeLeft = Number(sessionStorage.getItem(SS_TIMELEFT) || 0);
  const focusDuration = Number(sessionStorage.getItem(SS_DURATION) || 25 * 60);
  return { status, endTimestamp, timeLeft, focusDuration };
}

function clearStorage() {
  sessionStorage.removeItem(SS_STATUS);
  sessionStorage.removeItem(SS_END);
  sessionStorage.removeItem(SS_TIMELEFT);
  sessionStorage.removeItem(SS_DURATION);
}

function saveStorage(status: TimerStatus, focusDuration: number, endTimestamp: number, timeLeft: number) {
  sessionStorage.setItem(SS_STATUS, status);
  sessionStorage.setItem(SS_DURATION, String(focusDuration));
  sessionStorage.setItem(SS_END, String(endTimestamp));
  sessionStorage.setItem(SS_TIMELEFT, String(timeLeft));
}

export default function PomodoroTimer() {
  const [initialized, setInitialized] = useState(false);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [focusDuration, setFocusDuration] = useState(25 * 60);
  const [showDialog, setShowDialog] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [notification, setNotification] = useState<'focus-done' | 'break-done' | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimestampRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const vibrateGently = () => {
    try { navigator.vibrate?.(30); } catch {}
  };

  // Restore state on mount
  useEffect(() => {
    const stored = readStorage();
    if (stored.status === 'idle') {
      setInitialized(true);
      return;
    }
    setFocusDuration(stored.focusDuration);

    if (stored.status === 'paused') {
      setTimeLeft(stored.timeLeft);
      setStatus('paused');
    } else if (stored.status === 'focus' || stored.status === 'break') {
      const remaining = Math.ceil((stored.endTimestamp - Date.now()) / 1000);
      if (remaining > 0) {
        endTimestampRef.current = stored.endTimestamp;
        setTimeLeft(remaining);
        setStatus(stored.status);
      } else {
        // Timer expired while away
        vibrateGently();
        if (stored.status === 'focus') {
          setNotification('focus-done');
          setStatus('paused');
          setTimeLeft(0);
        } else {
          setNotification('break-done');
          setStatus('idle');
          setTimeLeft(0);
          clearStorage();
          setTimeout(() => setNotification(prev => prev === 'break-done' ? null : prev), 5000);
        }
      }
    }
    setInitialized(true);
  }, []);

  // Tick
  useEffect(() => {
    if (!initialized) return;
    if (status === 'focus' || status === 'break') {
      clearTimer();
      intervalRef.current = setInterval(() => {
        const remaining = Math.ceil((endTimestampRef.current - Date.now()) / 1000);
        if (remaining <= 0) {
          clearTimer();
          vibrateGently();
          if (status === 'focus') {
            setNotification('focus-done');
            setStatus('paused');
            setTimeLeft(0);
            saveStorage('paused', focusDuration, 0, 0);
          } else {
            setNotification('break-done');
            setStatus('idle');
            setTimeLeft(0);
            clearStorage();
            setTimeout(() => setNotification(prev => prev === 'break-done' ? null : prev), 5000);
          }
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    }
    return clearTimer;
  }, [status, initialized, clearTimer, focusDuration]);

  // Persist to sessionStorage on status/timeLeft changes
  useEffect(() => {
    if (!initialized) return;
    if (status === 'idle') {
      clearStorage();
    } else if (status === 'paused') {
      saveStorage('paused', focusDuration, 0, timeLeft);
    } else {
      saveStorage(status, focusDuration, endTimestampRef.current, timeLeft);
    }
  }, [status, timeLeft, focusDuration, initialized]);

  const startFocus = (seconds: number) => {
    const end = Date.now() + seconds * 1000;
    endTimestampRef.current = end;
    setFocusDuration(seconds);
    setTimeLeft(seconds);
    setStatus('focus');
    setShowDialog(false);
    setShowCustom(false);
    setNotification(null);
  };

  const startBreak = () => {
    const end = Date.now() + BREAK_DURATION * 1000;
    endTimestampRef.current = end;
    setTimeLeft(BREAK_DURATION);
    setStatus('break');
    setNotification(null);
  };

  const togglePause = () => {
    if (status === 'focus') {
      setStatus('paused');
    } else if (status === 'paused' && timeLeft > 0) {
      const end = Date.now() + timeLeft * 1000;
      endTimestampRef.current = end;
      setStatus('focus');
    }
  };

  const reset = () => {
    clearTimer();
    setStatus('idle');
    setTimeLeft(0);
    setNotification(null);
    clearStorage();
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
      {/* Compact timer */}
      <div className="flex flex-col items-end gap-1">
        {!isActive ? (
          <>
            <button
              onClick={() => setShowDialog(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer select-none"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}
            >
              <Timer className="h-3.5 w-3.5" style={{ color: 'rgba(212,175,55,0.5)' }} />
              <span className="text-[10px] font-medium" style={{ color: 'rgba(212,175,55,0.5)' }}>
                Pomodoro
              </span>
            </button>
            <span className="text-[10px] font-bold" style={{ color: '#ffffff' }}>
              ⏱ Cliquez ici pour activer le minuteur Pomodoro
            </span>
          </>
        ) : (
          <div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg select-none"
            style={{
              background: isBreak ? 'rgba(46,125,50,0.12)' : 'rgba(212,175,55,0.08)',
              border: `1px solid ${isBreak ? 'rgba(46,125,50,0.3)' : 'rgba(212,175,55,0.2)'}`,
            }}
          >
            <Timer className="h-3.5 w-3.5" style={{ color: isBreak ? '#4CAF50' : '#d4af37', opacity: 0.7 }} />
            <span className="text-xs font-bold tabular-nums" style={{ color: isBreak ? '#4CAF50' : '#d4af37' }}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {isBreak ? 'Pause' : 'Focus'}
            </span>
            {!isBreak && (
              <button
                onClick={togglePause}
                className="p-1 rounded-md transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                {status === 'paused' ? (
                  <Play className="h-3 w-3" style={{ color: '#d4af37' }} />
                ) : (
                  <Pause className="h-3 w-3" style={{ color: '#d4af37' }} />
                )}
              </button>
            )}
            <button
              onClick={reset}
              className="p-1 rounded-md transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <RotateCcw className="h-3 w-3" style={{ color: 'rgba(255,255,255,0.5)' }} />
            </button>
          </div>
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
