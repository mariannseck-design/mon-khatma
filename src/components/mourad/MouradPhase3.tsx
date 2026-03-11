import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Brain, Mic, Check, Play, Pause, RotateCcw } from 'lucide-react';
import { SURAHS } from '@/lib/surahData';
import { getExactVersePage } from '@/lib/quranData';
import { RECITERS } from '@/hooks/useQuranAudio';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import MouradMushafToggle, { type MushafMode, getMouradMushafMode, setMouradMushafMode } from './MouradMushafToggle';
import MouradPhysicalView from './MouradPhysicalView';
import HifzMushafImage from '@/components/hifz/HifzMushafImage';
import MouradVerseTextView from './MouradVerseTextView';

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  reciterId: string;
  onValidate: () => void;
}

type SubPhase = 'listen' | 'repetition' | 'recording';

export default function MouradPhase3({ surahNumber, startVerse, endVerse, reciterId, onValidate }: Props) {
  const [mushafMode, setMushafModeState] = useState<MushafMode>(getMouradMushafMode());
  const [page, setPage] = useState(1);
  const [subPhase, setSubPhase] = useState<SubPhase>('listen');
  const [listenCount, setListenCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);

  // Repetition tracking: per verse read 3x, memory 3x, then cumul
  const verseCount = endVerse - startVerse + 1;
  const [verseReadCounts, setVerseReadCounts] = useState<number[]>(new Array(verseCount).fill(0));
  const [verseMemoryCounts, setVerseMemoryCounts] = useState<number[]>(new Array(verseCount).fill(0));
  const [cumulReadCount, setCumulReadCount] = useState(0);
  const [cumulMemoryCount, setCumulMemoryCount] = useState(0);

  // Recording validation
  const [successfulRecordings, setSuccessfulRecordings] = useState(0);
  const [recordingAttempt, setRecordingAttempt] = useState(0);
  const { isRecording, recordingTime, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();

  const surah = SURAHS.find(s => s.number === surahNumber);

  useEffect(() => {
    getExactVersePage(surahNumber, startVerse).then(setPage);
  }, [surahNumber, startVerse]);

  const handleModeChange = (mode: MushafMode) => {
    setMushafModeState(mode);
    setMouradMushafMode(mode);
  };

  // Check if all per-verse repetitions are done
  const allVersesRead = verseReadCounts.every(c => c >= 3);
  const allVersesMemorized = verseMemoryCounts.every(c => c >= 3);
  const cumulDone = cumulReadCount >= 3 && cumulMemoryCount >= 3;
  const repetitionDone = allVersesRead && allVersesMemorized && cumulDone;

  const playAudio = useCallback(async () => {
    if (isPlaying && audioEl) { audioEl.pause(); setIsPlaying(false); return; }

    const reciter = RECITERS.find(r => r.id === reciterId) || RECITERS[0];
    let urls: string[] = [];

    if (reciter.source === 'everyayah' && reciter.folder) {
      for (let v = startVerse; v <= endVerse; v++) {
        urls.push(`https://everyayah.com/data/${reciter.folder}/${String(surahNumber).padStart(3, '0')}${String(v).padStart(3, '0')}.mp3`);
      }
    } else {
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${reciterId}`);
        const data = await res.json();
        if (data.code === 200) {
          urls = data.data.ayahs
            .filter((a: any) => a.numberInSurah >= startVerse && a.numberInSurah <= endVerse)
            .map((a: any) => a.audio);
        }
      } catch { return; }
    }

    if (!urls.length) return;
    let idx = 0;
    const playNext = () => {
      if (idx >= urls.length) {
        setIsPlaying(false);
        setListenCount(c => c + 1);
        return;
      }
      const audio = new Audio(urls[idx]);
      setAudioEl(audio);
      audio.onended = () => { idx++; playNext(); };
      audio.onerror = () => { idx++; playNext(); };
      audio.play().catch(() => setIsPlaying(false));
    };
    setIsPlaying(true);
    playNext();
  }, [isPlaying, audioEl, reciterId, surahNumber, startVerse, endVerse]);

  useEffect(() => { return () => { audioEl?.pause(); }; }, [audioEl]);

  // Auto-advance from listen to repetition
  useEffect(() => {
    if (listenCount >= 5 && subPhase === 'listen') {
      if (audioEl) audioEl.pause();
      setIsPlaying(false);
      setSubPhase('repetition');
    }
  }, [listenCount, subPhase, audioEl]);

  // Auto-advance to recording
  useEffect(() => {
    if (repetitionDone && subPhase === 'repetition') {
      setSubPhase('recording');
    }
  }, [repetitionDone, subPhase]);

  const handleRecordingDone = async () => {
    const blob = await stopRecording();
    if (!blob) return;

    // Simulate self-check: user marks as success or error
    // For now, auto-count as success (user validates)
    const newCount = successfulRecordings + 1;
    setSuccessfulRecordings(newCount);
    setRecordingAttempt(0);
  };

  const handleRecordingError = () => {
    cancelRecording();
    if (recordingAttempt >= 1) {
      // Error on 2nd attempt: reset all
      setSuccessfulRecordings(0);
      setRecordingAttempt(0);
    } else {
      setRecordingAttempt(a => a + 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(5,150,105,0.1)', color: '#059669' }}>
          <Brain className="h-3.5 w-3.5" />
          Phase 3 — Mémorisation & Liaison
        </div>
        <h2 className="text-lg font-bold text-gray-800">{surah?.name} · v.{startVerse}-{endVerse}</h2>
      </div>

      {/* Sub-phase: Listen */}
      {subPhase === 'listen' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-gray-400 text-xs mb-1">Écoutes (5 requises)</p>
            <p className="text-3xl font-bold" style={{ color: listenCount >= 5 ? '#059669' : '#6B7280' }}>
              {listenCount}<span className="text-lg text-gray-400">/5</span>
            </p>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={playAudio}
            className="w-full rounded-2xl py-3 flex items-center justify-center gap-2 font-semibold text-white"
            style={{ background: isPlaying ? '#6B7280' : '#059669' }}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            {isPlaying ? 'Pause' : 'Écouter'}
          </motion.button>

          <MouradMushafToggle mode={mushafMode} onChange={handleModeChange} />
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {mushafMode === 'image' && <HifzMushafImage surahNumber={surahNumber} startVerse={startVerse} endVerse={endVerse} maxHeight="250px" />}
            {mushafMode === 'text' && <MouradVerseTextView surahNumber={surahNumber} startVerse={startVerse} endVerse={endVerse} fontSize={22} maxHeight="250px" />}
            {mushafMode === 'physical' && <MouradPhysicalView surahNumber={surahNumber} startVerse={startVerse} endVerse={endVerse} />}
          </div>
        </div>
      )}

      {/* Sub-phase: Repetition */}
      {subPhase === 'repetition' && (
        <div className="space-y-4">
          <p className="text-gray-500 text-xs text-center">Pour chaque verset : Lis 3x puis récite de mémoire 3x</p>

          {Array.from({ length: verseCount }, (_, i) => (
            <div key={i} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-2">
              <p className="font-semibold text-gray-800 text-sm">Verset {startVerse + i}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setVerseReadCounts(c => { const n = [...c]; n[i] = Math.min(3, n[i] + 1); return n; })}
                  disabled={verseReadCounts[i] >= 3}
                  className="rounded-xl py-2 text-center text-sm font-medium transition-all disabled:opacity-50"
                  style={{ background: verseReadCounts[i] >= 3 ? 'rgba(5,150,105,0.15)' : 'rgba(0,0,0,0.04)', color: verseReadCounts[i] >= 3 ? '#059669' : '#374151' }}
                >
                  Lecture {verseReadCounts[i]}/3
                </button>
                <button
                  onClick={() => setVerseMemoryCounts(c => { const n = [...c]; n[i] = Math.min(3, n[i] + 1); return n; })}
                  disabled={verseMemoryCounts[i] >= 3 || verseReadCounts[i] < 3}
                  className="rounded-xl py-2 text-center text-sm font-medium transition-all disabled:opacity-50"
                  style={{ background: verseMemoryCounts[i] >= 3 ? 'rgba(5,150,105,0.15)' : 'rgba(0,0,0,0.04)', color: verseMemoryCounts[i] >= 3 ? '#059669' : '#374151' }}
                >
                  Mémoire {verseMemoryCounts[i]}/3
                </button>
              </div>
            </div>
          ))}

          {allVersesRead && allVersesMemorized && (
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-2">
              <p className="font-semibold text-gray-800 text-sm">Enchaînement complet</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCumulReadCount(c => Math.min(3, c + 1))}
                  disabled={cumulReadCount >= 3}
                  className="rounded-xl py-2 text-center text-sm font-medium transition-all disabled:opacity-50"
                  style={{ background: cumulReadCount >= 3 ? 'rgba(5,150,105,0.15)' : 'rgba(0,0,0,0.04)', color: cumulReadCount >= 3 ? '#059669' : '#374151' }}
                >
                  Lecture {cumulReadCount}/3
                </button>
                <button
                  onClick={() => setCumulMemoryCount(c => Math.min(3, c + 1))}
                  disabled={cumulMemoryCount >= 3 || cumulReadCount < 3}
                  className="rounded-xl py-2 text-center text-sm font-medium transition-all disabled:opacity-50"
                  style={{ background: cumulMemoryCount >= 3 ? 'rgba(5,150,105,0.15)' : 'rgba(0,0,0,0.04)', color: cumulMemoryCount >= 3 ? '#059669' : '#374151' }}
                >
                  Mémoire {cumulMemoryCount}/3
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-phase: Recording */}
      {subPhase === 'recording' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 text-center space-y-3">
            <Mic className="h-8 w-8 mx-auto" style={{ color: '#059669' }} />
            <p className="text-gray-800 font-semibold">Validation par enregistrement</p>
            <p className="text-gray-500 text-xs">
              Enregistre-toi 3 fois sans erreur. Si erreur à la 2ème tentative, retour à 0.
            </p>
            <p className="text-2xl font-bold" style={{ color: '#059669' }}>
              {successfulRecordings}<span className="text-lg text-gray-400">/3</span>
            </p>

            {successfulRecordings < 3 && (
              <div className="flex gap-2 justify-center">
                {!isRecording ? (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={startRecording}
                    className="rounded-2xl px-6 py-3 font-semibold text-white flex items-center gap-2"
                    style={{ background: '#059669' }}
                  >
                    <Mic className="h-4 w-4" /> Enregistrer
                  </motion.button>
                ) : (
                  <>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleRecordingDone}
                      className="rounded-2xl px-4 py-3 font-semibold text-white flex items-center gap-2"
                      style={{ background: '#059669' }}
                    >
                      <Check className="h-4 w-4" /> Valider ({recordingTime}s)
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleRecordingError}
                      className="rounded-2xl px-4 py-3 font-semibold text-white flex items-center gap-2 bg-red-500"
                    >
                      <RotateCcw className="h-4 w-4" /> Erreur
                    </motion.button>
                  </>
                )}
              </div>
            )}
          </div>

          {successfulRecordings >= 3 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={onValidate}
              className="w-full rounded-2xl py-4 flex items-center justify-center gap-3 font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #059669, #10B981)', boxShadow: '0 4px 20px rgba(5,150,105,0.3)' }}
            >
              <Check className="h-5 w-5" />
              Valider la mémorisation
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
}
