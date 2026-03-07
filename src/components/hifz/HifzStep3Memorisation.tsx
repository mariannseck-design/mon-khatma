import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Check, Eye, EyeOff, RotateCcw, Volume2, Star, ChevronDown, ChevronUp } from 'lucide-react';
import HifzStepWrapper from './HifzStepWrapper';
import { SURAHS } from '@/lib/surahData';

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  repetitionLevel: number;
  onNext: () => void;
  onBack: () => void;
}

const TIKRAR_TARGET = 40;

function getStorageKey(surah: number, start: number, end: number) {
  return `hifz_ancrage_${surah}_${start}_${end}`;
}

function getPhaseInfo(ancrage: number) {
  if (ancrage < 10) {
    return {
      phase: 1,
      emoji: '📖',
      label: 'Regardez le Mushaf et récitez avec le récitant',
      showMushafDefault: true,
      audioEnabled: true,
      color: '#4ecdc4',
    };
  }
  if (ancrage < 15) {
    return {
      phase: 2,
      emoji: '📖',
      label: 'Regardez le Mushaf, récitez sans le récitant',
      showMushafDefault: true,
      audioEnabled: false,
      color: '#f0d060',
    };
  }
  return {
    phase: 3,
    emoji: '🧠',
    label: 'Récitez de mémoire, sans Mushaf ni audio',
    showMushafDefault: false,
    audioEnabled: false,
    color: '#d4af37',
  };
}

export default function HifzStep3Memorisation({ surahNumber, startVerse, endVerse, onNext, onBack }: Props) {
  const navigate = useNavigate();
  const storageKey = getStorageKey(surahNumber, startVerse, endVerse);

  const [ancrage, setAncrage] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? Math.min(parseInt(saved, 10) || 0, TIKRAR_TARGET) : 0;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMushaf, setShowMushaf] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahsRef = useRef<{ audio: string }[]>([]);
  const indexRef = useRef(0);
  const reciter = localStorage.getItem('quran_reciter') || 'ar.alafasy';

  const phaseInfo = getPhaseInfo(ancrage);
  const mushafPage = SURAHS.find(s => s.number === surahNumber)?.startPage ?? 1;
  const mushafImageUrl = `https://cdn.jsdelivr.net/gh/QuranHub/quran-pages-images@main/easyquran.com/hafs-tajweed/${mushafPage}.jpg`;

  // Persist ancrage
  useEffect(() => {
    localStorage.setItem(storageKey, String(ancrage));
  }, [ancrage, storageKey]);

  useEffect(() => {
    if (ancrage >= TIKRAR_TARGET) {
      localStorage.removeItem(storageKey);
      setShowCelebration(true);
    }
  }, [ancrage, storageKey]);

  // Auto-show/hide mushaf based on phase
  useEffect(() => {
    setShowMushaf(phaseInfo.showMushafDefault);
  }, [phaseInfo.phase]);

  useEffect(() => {
    const fetchAyahs = async () => {
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${reciter}`);
        const data = await res.json();
        if (data.code === 200) {
          ayahsRef.current = data.data.ayahs
            .filter((a: any) => a.numberInSurah >= startVerse && a.numberInSurah <= endVerse)
            .map((a: any) => ({ audio: a.audio }));
        }
      } catch { /* ignore */ }
    };
    fetchAyahs();
  }, [surahNumber, startVerse, endVerse, reciter]);

  const playNextAyah = useCallback((idx: number) => {
    if (idx >= ayahsRef.current.length) {
      // Passage terminé : incrémenter le compteur
      setAncrage(prev => {
        const next = Math.min(prev + 1, TIKRAR_TARGET);
        try { navigator?.vibrate?.(40); } catch {}
        if (next >= TIKRAR_TARGET) {
          // Objectif atteint, arrêter
          setIsPlaying(false);
          return next;
        }
        // Boucler : relancer le passage depuis le début
        setTimeout(() => playNextAyah(0), 600);
        return next;
      });
      indexRef.current = 0;
      return;
    }
    indexRef.current = idx;
    const audio = new Audio(ayahsRef.current[idx].audio);
    audioRef.current = audio;
    audio.onended = () => playNextAyah(idx + 1);
    audio.onerror = () => playNextAyah(idx + 1);
    audio.play().catch(() => setIsPlaying(false));
  }, []);

  const toggleAudioHelp = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else if (ayahsRef.current.length > 0) {
      setIsPlaying(true);
      playNextAyah(0);
    }
  };

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  const openInMushaf = () => {
    localStorage.setItem('quran_reader_page', String(mushafPage));
    navigate('/quran-reader');
  };

  const progress = Math.min((ancrage / TIKRAR_TARGET) * 100, 100);
  const isComplete = ancrage >= TIKRAR_TARGET;

  return (
    <HifzStepWrapper stepNumber={3} stepTitle="Tikrar" onBack={onBack}>
      <div className="text-center space-y-4">
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
          style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.3)' }}
        >
          <BookOpen className="h-8 w-8" style={{ color: '#d4af37' }} />
        </div>

        {/* Subtitle */}
        <div>
          <p className="text-sm font-semibold" style={{ color: '#d4af37' }}>L'ancrage d'acier</p>
          <p className="text-white/50 text-xs">(Objectif 40 répétitions)</p>
        </div>

        {/* Guide introductif */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-all"
            style={{ color: '#d4af37' }}
          >
            <span>📋 Mode d'emploi du Tikrar</span>
            {showGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <AnimatePresence>
            {showGuide && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3 text-left">
                  <p className="text-xs text-white/70 leading-relaxed">
                    Pour graver ce passage dans votre cœur par la grâce d'Allah{' '}
                    <span style={{ fontFamily: "'Amiri', serif", fontWeight: 'bold', fontSize: '1.1em' }}>(عز وجل)</span>
                    , nous vous suggérons un minimum de 15 répétitions pour la première séance. À titre de référence, l'école Tikrar de Médine préconise 40 répétitions pour une maîtrise parfaite.
                  </p>

                  <p className="text-xs font-semibold" style={{ color: '#d4af37' }}>Mode d'emploi de votre progression :</p>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2 rounded-lg px-3 py-2" style={{ background: ancrage < 10 ? 'rgba(78,205,196,0.15)' : 'transparent', border: ancrage < 10 ? '1px solid rgba(78,205,196,0.3)' : '1px solid transparent' }}>
                      <span className="text-xs mt-0.5 whitespace-nowrap" style={{ color: '#4ecdc4', fontWeight: ancrage < 10 ? 700 : 400 }}>1 à 10</span>
                      <p className="text-xs text-white/70">📖 Regardez le Mushaf et récitez avec le récitant pour maîtriser le Tajwid.</p>
                    </div>
                    <div className="flex items-start gap-2 rounded-lg px-3 py-2" style={{ background: ancrage >= 10 && ancrage < 15 ? 'rgba(240,208,96,0.15)' : 'transparent', border: ancrage >= 10 && ancrage < 15 ? '1px solid rgba(240,208,96,0.3)' : '1px solid transparent' }}>
                      <span className="text-xs mt-0.5 whitespace-nowrap" style={{ color: '#f0d060', fontWeight: ancrage >= 10 && ancrage < 15 ? 700 : 400 }}>11 à 15</span>
                      <p className="text-xs text-white/70">📖 Regardez le Mushaf et récitez sans le récitant (audio désactivé).</p>
                    </div>
                    <div className="flex items-start gap-2 rounded-lg px-3 py-2" style={{ background: ancrage >= 15 ? 'rgba(212,175,55,0.15)' : 'transparent', border: ancrage >= 15 ? '1px solid rgba(212,175,55,0.3)' : '1px solid transparent' }}>
                      <span className="text-xs mt-0.5 whitespace-nowrap" style={{ color: '#d4af37', fontWeight: ancrage >= 15 ? 700 : 400 }}>Dès la 16ème</span>
                      <p className="text-xs text-white/70">🧠 Récitez exclusivement de mémoire, sans Mushaf et sans audio.</p>
                    </div>
                  </div>

                  <p className="text-xs text-white/50 italic leading-relaxed">
                    En cas de doute (oubli ou Tajwid), cliquez sur l'icône du haut-parleur 🔊 ou jetez un bref coup d'œil au Mushaf.
                  </p>

                  <p className="text-xs text-white/70 leading-relaxed">
                    Prenez le temps nécessaire. Votre persévérance honore le message transmis par le Prophète Mouhamed{' '}
                    <span style={{ fontFamily: "'Amiri', serif", fontWeight: 'bold', fontSize: '1.1em' }}>(ﷺ)</span>
                    . Bismillah !
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Celebration overlay */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-5 space-y-3"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)' }}
            >
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Star className="h-5 w-5 fill-current" style={{ color: '#d4af37' }} />
                  </motion.div>
                ))}
              </div>
              <p className="text-white text-sm leading-relaxed">
                Félicitations ! Votre ancrage Tikrar est terminé. Par la grâce d'Allah{' '}
                <span style={{ fontFamily: "'Amiri', serif", fontWeight: 'bold', fontSize: '1.1em' }}>(عز وجل)</span>
                , vous avez honoré ce dépôt sacré.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Big counter */}
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="44" fill="none"
              stroke={isComplete ? '#d4af37' : phaseInfo.color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.76} 276`}
              style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.3s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color: '#d4af37' }}>{ancrage}</span>
            <span className="text-white/40 text-xs">/ {TIKRAR_TARGET}</span>
          </div>
        </div>

        {/* Phase indicator */}
        {!isComplete && (
          <motion.div
            key={phaseInfo.phase}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl px-4 py-2.5 mx-auto max-w-xs"
            style={{ background: `${phaseInfo.color}15`, border: `1px solid ${phaseInfo.color}40` }}
          >
            <p className="text-xs font-medium" style={{ color: phaseInfo.color }}>
              {phaseInfo.emoji} {phaseInfo.label}
            </p>
          </motion.div>
        )}

        {/* Benevolence message (phase 3) */}
        {ancrage >= 15 && ancrage < TIKRAR_TARGET && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl px-4 py-3 mx-auto max-w-xs text-left"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <p className="text-white/70 text-xs italic leading-relaxed">
              N'ayez aucune crainte si vous devez jeter un coup d'œil furtif au Mushaf après la 15ème répétition. 
              Le cerveau apprend aussi par la correction. Ce n'est pas un échec, mais une étape vers la maîtrise parfaite. 
              L'essentiel est la sincérité de votre effort pour plaire à Allah{' '}
              <span style={{ fontFamily: "'Amiri', serif", fontWeight: 'bold', fontSize: '1.1em' }}>(عز وجل)</span>
              , à l'image de la persévérance des Prophètes{' '}
              <span style={{ fontFamily: "'Amiri', serif", fontWeight: 'bold', fontSize: '1.1em' }}>(عليهم السلام)</span>.
            </p>
          </motion.div>
        )}

        {/* Reset button */}
        {ancrage > 0 && !isComplete && (
          <button
            onClick={() => {
              if (window.confirm('Réinitialiser le compteur d\'ancrage ? Ta progression sera perdue.')) {
                setAncrage(0);
                localStorage.removeItem(storageKey);
                audioRef.current?.pause();
                setIsPlaying(false);
              }
            }}
            className="flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg text-xs transition-all active:scale-95"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <RotateCcw className="h-3 w-3" />
            Recommencer
          </button>
        )}

        {/* Mushaf toggle + view */}
        <div className="relative">
          <button
            onClick={() => setShowMushaf(!showMushaf)}
            className="flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 mb-3"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}
          >
            {showMushaf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showMushaf ? 'Masquer le passage' : 'Voir le passage'}
          </button>

          <AnimatePresence>
            {showMushaf && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div
                  className="max-h-56 overflow-auto w-full rounded-xl"
                  style={{ border: '1px solid rgba(212,175,55,0.25)' }}
                >
                  <img
                    src={mushafImageUrl}
                    alt={`Page ${mushafPage} du Mushaf`}
                    className="w-full h-auto"
                    loading="eager"
                  />
                </div>
                <button
                  onClick={openInMushaf}
                  className="flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}
                >
                  <BookOpen className="h-4 w-4" />
                  Ouvrir dans le Mushaf
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Audio controls — manual +1 for all phases + speaker for help */}
        {!isComplete && (
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => {
                  setAncrage(prev => Math.min(prev + 1, TIKRAR_TARGET));
                  try { navigator?.vibrate?.(40); } catch {}
                }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(212,175,55,0.15)',
                  border: '2px solid rgba(212,175,55,0.4)',
                }}
              >
                <span className="text-2xl font-bold" style={{ color: '#d4af37' }}>+1</span>
              </motion.button>

              {ancrage < 10 && (
                <button
                  onClick={toggleAudioHelp}
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 ml-4"
                  style={{ 
                    background: isPlaying ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.08)', 
                    border: isPlaying ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.15)' 
                  }}
                  title={isPlaying ? 'Arrêter l\'audio' : 'Écouter le passage complet'}
                >
                  <Volume2 className="h-5 w-5" style={{ color: isPlaying ? '#d4af37' : 'rgba(255,255,255,0.5)' }} />
                </button>
              )}
            </div>

            {ancrage >= 10 && (
              <button
                onClick={toggleAudioHelp}
                className="flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg text-xs transition-all active:scale-95"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                title={isPlaying ? 'Arrêter l\'audio' : 'Aide audio (en cas de doute)'}
              >
                <Volume2 className="h-3 w-3" style={{ color: isPlaying ? '#d4af37' : 'rgba(255,255,255,0.3)' }} />
                <span style={{ color: isPlaying ? '#d4af37' : undefined }}>
                  {isPlaying ? 'Arrêter' : 'Aide audio'}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Next button — only when 40/40 reached */}
        {isComplete && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold"
            style={{
              background: 'linear-gradient(135deg, #d4af37, #b8962e)',
              color: '#1a2e1a',
            }}
          >
            <Check className="h-5 w-5" />
            Passer au test de validation
          </motion.button>
        )}
      </div>
    </HifzStepWrapper>
  );
}
