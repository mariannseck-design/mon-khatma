import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Pause, Check, X, Eye } from 'lucide-react';
import HifzStepWrapper from './HifzStepWrapper';
import { SURAHS } from '@/lib/surahData';

const ENCOURAGEMENTS = [
  {
    title: 'Chaque effort est récompensé',
    text: "Ne te décourage pas. L'erreur est une étape naturelle vers la perfection. Rappelle-toi que le Prophète (عليه السلام) a enseigné que celui qui récite le Coran avec difficulté obtient une double récompense. Prends une grande inspiration et reprenons.",
    button: 'Je recommence mon essai',
  },
  {
    title: 'Une nouvelle chance',
    text: "La mémorisation est un chemin de patience. Cette erreur t'aide à mieux ancrer le verset pour la prochaine fois. Recommençons cet enregistrement en plaçant notre confiance en Allah (عز وجل).",
    button: 'Essayer à nouveau',
  },
  {
    title: 'Presque parfait !',
    text: "Le Hifz demande de la répétition. Reprends ton souffle, concentre-toi et relance l'enregistrement. Tu vas y arriver !",
    button: "Reprendre l'enregistrement",
  },
];

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  onNext: () => void;
  onBack: () => void;
  onPause?: () => void;
}

export default function HifzStep4Validation({ surahNumber, startVerse, endVerse, onNext, onBack, onPause }: Props) {
  const [arabicVerses, setArabicVerses] = useState<{ number: number; text: string }[]>([]);
  const [mushafPage, setMushafPage] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0); // 0-based
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encourageIdx, setEncourageIdx] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackRef = useRef<HTMLAudioElement | null>(null);

  // Compute mushaf page from surah number
  useEffect(() => {
    const surah = SURAHS.find(s => s.number === surahNumber);
    if (surah) {
      setMushafPage(surah.startPage);
    }
  }, [surahNumber]);

  // Fetch arabic text (kept for potential future use)
  useEffect(() => {
    const fetchArabic = async () => {
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`);
        const data = await res.json();
        if (data.code === 200) {
          setArabicVerses(
            data.data.ayahs
              .filter((a: any) => a.numberInSurah >= startVerse && a.numberInSurah <= endVerse)
              .map((a: any) => ({ number: a.numberInSurah, text: a.text }))
          );
        }
      } catch { /* ignore */ }
    };
    fetchArabic();
  }, [surahNumber, startVerse, endVerse]);

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
    } catch {
      // Permission denied
    }
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

  const togglePlayback = () => {
    if (isPlayingBack) {
      playbackRef.current?.pause();
      setIsPlayingBack(false);
      return;
    }
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    playbackRef.current = audio;
    audio.onended = () => setIsPlayingBack(false);
    audio.play();
    setIsPlayingBack(true);
  };

  const handleSuccess = () => {
    destroyAudio();
    if (attempt >= 2) {
      onNext(); // 3 successes
    } else {
      setAttempt(prev => prev + 1);
    }
  };

  const handleError = () => {
    destroyAudio();
    setEncourageIdx(prev => (prev + 1) % ENCOURAGEMENTS.length);
    setShowEncouragement(true);
  };

  const handleRetry = () => {
    setShowEncouragement(false);
    setAttempt(0); // Reset all 3 attempts
  };

  const mins = Math.floor(recordingTime / 60);
  const secs = recordingTime % 60;

  return (
    <HifzStepWrapper stepNumber={4} stepTitle="Test de Validation" onBack={onBack} onPause={onPause}>
      <div className="space-y-5">
        <p className="text-white/80 text-sm leading-relaxed text-center px-2">
          Enregistre-toi 3 fois de suite sans regarder le Coran. Tu peux écouter ton audio ensuite pour vérifier.
          Si tu réussis les 3 sans erreur, tu as validé ton Hifz !
        </p>

        {/* Attempt indicators */}
        <div className="flex items-center justify-center gap-3">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: i < attempt ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)',
                border: `2px solid ${i < attempt ? '#d4af37' : i === attempt ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                color: i < attempt ? '#d4af37' : 'rgba(255,255,255,0.4)',
              }}
            >
              {i < attempt ? '✓' : `${i + 1}`}
            </div>
          ))}
        </div>
        <p className="text-white/40 text-xs text-center">Essai {attempt + 1}/3</p>

        {/* Blurred Mushaf image */}
        <div
          className="rounded-2xl relative overflow-hidden cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}
          onTouchStart={() => setShowText(true)}
          onTouchEnd={() => setShowText(false)}
          onMouseDown={() => setShowText(true)}
          onMouseUp={() => setShowText(false)}
          onMouseLeave={() => setShowText(false)}
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <p className="text-white/40 text-xs uppercase tracking-wider">AYAT</p>
            <Eye className="h-4 w-4 text-white/30" />
          </div>
          <div
            className="px-2 pb-2 transition-all duration-300"
            style={{
              filter: showText ? 'none' : 'blur(8px)',
            }}
          >
            {mushafPage && (
              <img
                src={`https://cdn.jsdelivr.net/gh/QuranHub/quran-pages-images@main/easyquran.com/hafs-tajweed/${mushafPage}.jpg`}
                alt={`Page ${mushafPage} du Mushaf`}
                className="w-full rounded-lg"
                style={{ maxHeight: '200px', objectFit: 'contain' }}
              />
            )}
          </div>
          {!showText && (
            <p className="text-white/30 text-xs text-center pb-3">Maintiens appuyé pour vérifier</p>
          )}
        </div>

        {/* Recording UI */}
        {!audioBlob ? (
          <div className="text-center space-y-3">
            {isRecording && (
              <div className="text-xl font-mono text-white/80">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </div>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={isRecording ? stopRecording : startRecording}
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
              style={{
                background: isRecording ? 'rgba(220,50,50,0.3)' : 'rgba(212,175,55,0.2)',
                border: `3px solid ${isRecording ? '#dc3232' : '#d4af37'}`,
              }}
            >
              {isRecording
                ? <Square className="h-7 w-7 text-red-400" />
                : <Mic className="h-8 w-8" style={{ color: '#d4af37' }} />
              }
            </motion.button>
            <p className="text-white/40 text-xs">
              {isRecording ? 'Appuie pour arrêter' : 'Appuie pour enregistrer'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Playback */}
            <div className="flex items-center justify-center gap-4">
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
                onClick={handleSuccess}
                className="rounded-xl py-4 flex items-center justify-center gap-2 font-semibold text-sm"
                style={{ background: 'rgba(80,200,120,0.2)', color: '#50c878', border: '1px solid rgba(80,200,120,0.3)' }}
              >
                <Check className="h-5 w-5" />
                Essai réussi
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleError}
                className="rounded-xl py-4 flex items-center justify-center gap-2 font-semibold text-sm"
                style={{ background: 'rgba(220,50,50,0.15)', color: '#dc6464', border: '1px solid rgba(220,50,50,0.25)' }}
              >
                <X className="h-5 w-5" />
                J'ai fait une erreur
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Encouragement popup */}
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
              style={{
                background: 'linear-gradient(135deg, #faf8f0, #f5f0e0)',
                border: '2px solid rgba(212,175,55,0.5)',
              }}
            >
              <h3
                className="text-lg font-bold mb-3"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}
              >
                {ENCOURAGEMENTS[encourageIdx].title}
              </h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#0d5f5f' }}>
                {ENCOURAGEMENTS[encourageIdx].text}
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleRetry}
                className="w-full rounded-xl py-3 font-semibold"
                style={{ background: '#0d7377', color: 'white' }}
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
