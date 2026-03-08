import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Pause, Check, X, Eye, ChevronDown, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import HifzStepWrapper from './HifzStepWrapper';
import HifzMushafImage from './HifzMushafImage';

/* ── Encouragements ── */
const ENCOURAGEMENTS = [
  {
    title: 'Chaque effort est récompensé',
    text: "Ne te décourage pas. L'erreur est une étape naturelle vers la perfection. Celui qui récite le Coran avec difficulté obtient une double récompense. Regardez le texte si besoin et reprenez la série pour bien ancrer. Prends une grande inspiration et reprenons.",
    button: 'Je recommence mon essai',
  },
  {
    title: 'Une nouvelle chance',
    text: "La mémorisation est un chemin de patience. Cette erreur t'aide à mieux ancrer le verset. Regardez le texte si besoin et reprenez la série pour bien ancrer. Recommençons en plaçant notre confiance en Allah (عز وجل).",
    button: 'Essayer à nouveau',
  },
  {
    title: 'Presque parfait !',
    text: "Le Hifz demande de la répétition. Regardez le texte si besoin et reprenez la série pour bien ancrer. Reprends ton souffle, concentre-toi et relance l'enregistrement. Tu vas y arriver !",
    button: "Reprendre l'enregistrement",
  },
];

/* ── Waveform CSS (inline keyframes) ── */
const waveBarStyle = (i: number): React.CSSProperties => ({
  width: 4,
  borderRadius: 2,
  background: '#065F46',
  animation: `waveAnim 0.8s ease-in-out ${i * 0.12}s infinite alternate`,
});

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  onNext: () => void;
  onBack: () => void;
  onPause?: () => void;
}

export default function HifzStep4Validation({ surahNumber, startVerse, endVerse, onNext, onBack, onPause }: Props) {
  const [successes, setSuccesses] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [showPeek, setShowPeek] = useState(false);
  const [peekCount, setPeekCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalSuccesses, setTotalSuccesses] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encourageIdx, setEncourageIdx] = useState(0);
  const [validated, setValidated] = useState(false);
  const [bonusMode, setBonusMode] = useState(false);
  const [bonusCount, setBonusCount] = useState(0);
  const [showAdvice, setShowAdvice] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyAudio();
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state !== 'inactive') {
        mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const destroyAudio = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    playbackRef.current?.pause();
    playbackRef.current = null;
    setIsPlayingBack(false);
  }, [audioUrl]);

  /* ── Recording ── */
  const startRecording = async () => {
    destroyAudio();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      chunksRef.current = [];
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch { /* permission denied */ }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setAudioUrl(url);
      mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
    };
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  /* ── Playback ── */
  const togglePlayback = () => {
    if (isPlayingBack) { playbackRef.current?.pause(); setIsPlayingBack(false); return; }
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    playbackRef.current = audio;
    audio.onended = () => setIsPlayingBack(false);
    audio.play();
    setIsPlayingBack(true);
  };

  /* ── Validation logic ── */
  const handleSuccess = () => {
    destroyAudio();
    setTotalAttempts(prev => prev + 1);
    setTotalSuccesses(prev => prev + 1);
    const next = successes + 1;
    if (next >= 3) {
      setSuccesses(3);
      setValidated(true);
    } else {
      setSuccesses(next);
    }
  };

  const handleError = () => {
    destroyAudio();
    setTotalAttempts(prev => prev + 1);
    setTotalErrors(prev => prev + 1);
    setSuccesses(0);
    setEncourageIdx(prev => (prev + 1) % ENCOURAGEMENTS.length);
    setShowEncouragement(true);
  };

  const handleRetry = () => setShowEncouragement(false);

  /* ── Peek penalty ── */
  const handlePeek = () => {
    setShowPeek(true);
    setPeekCount(prev => prev + 1);
    setSuccesses(0);
    toast({ title: 'Compteur remis à zéro', description: 'Les 3 essais doivent être réussis de mémoire pure, sans aucune aide.' });
  };

  const mins = Math.floor(recordingTime / 60);
  const secs = recordingTime % 60;

  /* ── Bonus mode handlers ── */
  const handleBonusSuccess = () => {
    destroyAudio();
    setBonusCount(prev => prev + 1);
    setTotalAttempts(prev => prev + 1);
    setTotalSuccesses(prev => prev + 1);
  };

  const handleBonusError = () => {
    destroyAudio();
    setTotalAttempts(prev => prev + 1);
    setTotalErrors(prev => prev + 1);
  };

  const handleContinueReciting = () => {
    setBonusMode(true);
    setValidated(false);
  };

  /* ── Validated state ── */
  if (validated && !bonusMode) {
    return (
      <HifzStepWrapper stepNumber={4} stepTitle="Validation" onBack={onBack} onPause={onPause}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-8 text-center space-y-5"
          style={{ background: '#FDFBF7', border: '2px solid #D4AF37' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.15)', border: '3px solid #D4AF37' }}
          >
            <Check className="h-10 w-10" style={{ color: '#D4AF37' }} />
          </motion.div>

          <div className="flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'rgba(212,175,55,0.2)', border: '2px solid #D4AF37', color: '#D4AF37' }}>✓</div>
            ))}
          </div>

          <p className="text-lg font-bold" style={{ color: '#1C2421', fontFamily: "'Playfair Display', Georgia, serif" }}>
            Votre mémorisation est scellée<br />par la grâce d'Allah <span style={{ fontFamily: "'Amiri'", fontWeight: 'bold', fontSize: '1.1em' }}>(عز وجل)</span>
          </p>
          <p className="text-sm" style={{ color: '#065F46' }}>
            3{bonusCount > 0 ? ` + ${bonusCount}` : ''} récitation{(3 + bonusCount) > 1 ? 's' : ''} parfaite{(3 + bonusCount) > 1 ? 's' : ''} sans aide
          </p>
          <div className="flex justify-center gap-4 text-xs" style={{ color: 'rgba(6,95,70,0.6)' }}>
            <span>{totalAttempts} tentative{totalAttempts > 1 ? 's' : ''}</span>
            <span>·</span>
            <span>{totalErrors} erreur{totalErrors > 1 ? 's' : ''}</span>
            {peekCount > 0 && <><span>·</span><span>{peekCount} coup{peekCount > 1 ? 's' : ''} d'œil</span></>}
          </div>

          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onNext}
              className="w-full rounded-xl py-4 font-bold text-base"
              style={{ background: '#065F46', color: '#FDFBF7' }}
            >
              Valider mon Hifz ✨
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleContinueReciting}
              className="w-full rounded-xl py-3 font-semibold text-sm"
              style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}
            >
              🔁 Continuer à réciter
            </motion.button>
          </div>
        </motion.div>
      </HifzStepWrapper>
    );
  }

  return (
    <HifzStepWrapper stepNumber={4} stepTitle="Validation" onBack={onBack} onPause={onPause}>
      {/* Inject waveform keyframes */}
      <style>{`@keyframes waveAnim { 0% { height: 8px; } 100% { height: 28px; } }`}</style>

      <div className="space-y-5">
        {/* Instruction */}
        <p className="text-sm leading-relaxed text-center px-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Enregistre-toi <strong>3 fois de suite</strong> sans regarder le Coran.
          Si tu regardes, le compteur se réinitialise.
        </p>

        {/* Message d'exigence spirituel — collapsible */}
        <div className="rounded-xl mx-1 overflow-hidden" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <button
            onClick={() => setShowAdvice(prev => !prev)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-left"
          >
            <span className="text-xs font-medium" style={{ color: 'rgba(212,175,55,0.7)' }}>Conseil</span>
            <motion.div animate={{ rotate: showAdvice ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-3.5 w-3.5" style={{ color: 'rgba(212,175,55,0.5)' }} />
            </motion.div>
          </button>
          <AnimatePresence>
            {showAdvice && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-xs leading-relaxed italic text-center px-4 pb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  « Si vous éprouvez le moindre doute lors de la récitation, c'est le signe que l'ancrage n'est pas encore solide. Regardez le texte, puis recommencez votre série de 3 à zéro. Cette rigueur est le secret d'une mémoire inaltérable. »
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Badges 1-2-3 ── */}
        <div className="flex items-center justify-center gap-4">
          {[0, 1, 2].map(i => {
            const done = i < successes;
            const active = i === successes;
            return (
              <motion.div
                key={i}
                animate={done ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.4 }}
                className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: done ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.06)',
                  border: `2.5px solid ${done ? '#D4AF37' : active ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.12)'}`,
                  color: done ? '#D4AF37' : active ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
                  boxShadow: active ? '0 0 12px rgba(212,175,55,0.2)' : 'none',
                }}
              >
                {done ? <Check className="h-5 w-5" /> : `${i + 1}`}
              </motion.div>
            );
          })}
        </div>
        <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Essai {Math.min(successes + 1, 3)}/3
          {totalAttempts > 0 && ` · ${totalAttempts} tentative${totalAttempts > 1 ? 's' : ''} au total`}
        </p>

        {/* ── Peek section ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.12)' }}>
          <AnimatePresence mode="wait">
            {showPeek ? (
              <motion.div key="peek" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <HifzMushafImage surahNumber={surahNumber} startVerse={startVerse} endVerse={endVerse} maxHeight="220px" />
                <div className="flex justify-center pb-3">
                  <button
                    onClick={() => setShowPeek(false)}
                    className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                  >
                    Fermer
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5 text-center space-y-3">
                <Eye className="h-6 w-6 mx-auto" style={{ color: 'rgba(255,255,255,0.15)' }} />
                <button
                  onClick={handlePeek}
                  className="text-xs px-4 py-2 rounded-xl transition-all active:scale-95"
                  style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}
                >
                  👁️ Jeter un œil rapide
                </button>
                <p className="text-[10px] font-medium" style={{ color: 'rgba(220,50,50,0.5)' }}>
                  ⚠️ Remet vos 3 essais à zéro
                  {peekCount > 0 && ` · ${peekCount} coup${peekCount > 1 ? 's' : ''} d'œil`}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Dictaphone ── */}
        {!audioBlob ? (
          <div className="text-center space-y-3">
            {isRecording && (
              <>
                <div className="text-xl font-mono" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                </div>
                {/* Waveform */}
                <div className="flex items-center justify-center gap-1.5 h-8">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} style={waveBarStyle(i)} />
                  ))}
                </div>
              </>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onPointerDown={isRecording ? stopRecording : startRecording}
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center relative"
              style={{
                touchAction: 'manipulation',
                background: isRecording ? 'rgba(220,50,50,0.2)' : 'rgba(6,95,70,0.2)',
                border: `3px solid ${isRecording ? '#dc3232' : '#065F46'}`,
              }}
            >
              {isRecording && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '2px solid rgba(220,50,50,0.3)' }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              {isRecording
                ? <Square className="h-7 w-7 text-red-400" />
                : <Mic className="h-8 w-8" style={{ color: '#065F46' }} />
              }
            </motion.button>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {isRecording ? 'Appuie pour arrêter' : 'Appuie pour enregistrer'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Playback */}
            <div className="flex justify-center">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={togglePlayback}
                className="px-5 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                {isPlayingBack ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlayingBack ? 'Pause' : 'Réécouter'}
              </motion.button>
            </div>

            {/* Validation buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={bonusMode ? handleBonusSuccess : handleSuccess}
                className="rounded-xl py-4 flex items-center justify-center gap-2 font-semibold text-sm"
                style={{ background: 'rgba(6,95,70,0.15)', color: '#34D399', border: '1px solid rgba(6,95,70,0.3)' }}
              >
                <Check className="h-5 w-5" />
                Parfait
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={bonusMode ? handleBonusError : handleError}
                className="rounded-xl py-4 flex items-center justify-center gap-2 font-semibold text-sm"
                style={{ background: 'rgba(220,50,50,0.1)', color: '#dc6464', border: '1px solid rgba(220,50,50,0.2)' }}
              >
                <X className="h-5 w-5" />
                Erreur
              </motion.button>
            </div>

            {/* Privacy note */}
            <div className="flex items-center justify-center gap-1.5">
              <Lock className="h-3 w-3" style={{ color: 'rgba(255,255,255,0.25)' }} />
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Tes enregistrements restent sur ton appareil et sont supprimés automatiquement
              </p>
            </div>

            {/* Bonus mode: button to finalize */}
            {bonusMode && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { setValidated(true); setBonusMode(false); }}
                className="w-full rounded-xl py-3 font-semibold text-sm"
                style={{ background: '#065F46', color: '#FDFBF7' }}
              >
                Valider mon Hifz ✨ ({3 + bonusCount} récitations)
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* ── Encouragement popup ── */}
      <AnimatePresence>
        {showEncouragement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm rounded-2xl p-6 text-center"
              style={{ background: '#FDFBF7', border: '2px solid rgba(212,175,55,0.4)' }}
            >
              <h3 className="text-lg font-bold mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#D4AF37' }}>
                {ENCOURAGEMENTS[encourageIdx].title}
              </h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#1C2421' }}>
                {ENCOURAGEMENTS[encourageIdx].text}
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleRetry}
                className="w-full rounded-xl py-3 font-semibold"
                style={{ background: '#065F46', color: '#FDFBF7' }}
              >
                {ENCOURAGEMENTS[encourageIdx].button}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </HifzStepWrapper>
  );
}
