import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Check, Sparkles, BookOpen } from 'lucide-react';
import HifzStepWrapper from './HifzStepWrapper';
import HifzMushafToggle, { getMushafMode, setMushafMode, type MushafMode } from './HifzMushafToggle';
import HifzMushafImage from './HifzMushafImage';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SURAHS } from '@/lib/surahData';
import { getVersesByRange, LocalAyah } from '@/lib/quranData';

interface Props {
  onNext: () => void;
  onBack: () => void;
  onPause?: () => void;
}

interface YesterdayVerse {
  surahNumber: number;
  verseStart: number;
  verseEnd: number;
  surahName: string;
}

export default function HifzStep1Revision({ onNext, onBack, onPause }: Props) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [timer, setTimer] = useState(300);
  const [yesterdayVerses, setYesterdayVerses] = useState<YesterdayVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirstDay, setIsFirstDay] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Rescue mode states
  const [rescueMode, setRescueMode] = useState(false);
  const [rescueCount, setRescueCount] = useState(0);
  const [verseTexts, setVerseTexts] = useState<LocalAyah[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(false);

  // Fetch yesterday's memorized verses
  useEffect(() => {
    const fetchYesterday = async () => {
      if (!user) {
        setIsFirstDay(true);
        setLoading(false);
        return;
      }

      try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStart = yesterday.toISOString().split('T')[0] + 'T00:00:00';
        const yesterdayEnd = yesterday.toISOString().split('T')[0] + 'T23:59:59';

        const { data: sessions } = await supabase
          .from('hifz_sessions')
          .select('surah_number, start_verse, end_verse')
          .eq('user_id', user.id)
          .not('completed_at', 'is', null)
          .gte('completed_at', yesterdayStart)
          .lte('completed_at', yesterdayEnd);

        if (sessions && sessions.length > 0) {
          const verses: YesterdayVerse[] = sessions.map(s => {
            const surah = SURAHS.find(su => su.number === s.surah_number);
            return {
              surahNumber: s.surah_number,
              verseStart: s.start_verse,
              verseEnd: s.end_verse,
              surahName: surah?.name || `Sourate ${s.surah_number}`,
            };
          });
          setYesterdayVerses(verses);
        } else {
          const { count: totalSessions } = await supabase
            .from('hifz_sessions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .not('completed_at', 'is', null);

          setIsFirstDay(!totalSessions || totalSessions === 0);
        }
      } catch (err) {
        console.error('Error fetching yesterday data:', err);
        setIsFirstDay(true);
      }
      setLoading(false);
    };

    fetchYesterday();
  }, [user]);

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (!isFirstDay && !loading) {
      startTimer();
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isFirstDay, loading]);

  const handleReset = () => {
    setCount(0);
    setTimer(300);
    startTimer();
  };

  const activateRescueMode = async () => {
    setRescueMode(true);
    setRescueCount(0);
    setLoadingVerses(true);

    try {
      const allVerses: LocalAyah[] = [];
      for (const v of yesterdayVerses) {
        const verses = await getVersesByRange(v.surahNumber, v.verseStart, v.verseEnd);
        allVerses.push(...verses);
      }
      setVerseTexts(allVerses);
    } catch (err) {
      console.error('Error loading verse texts:', err);
    }
    setLoadingVerses(false);
  };

  const handleRescueComplete = () => {
    // Exit rescue mode and reset main counter
    setRescueMode(false);
    setRescueCount(0);
    setVerseTexts([]);
    setCount(0);
  };

  const mins = Math.floor(timer / 60);
  const secs = timer % 60;

  if (loading) {
    return (
      <HifzStepWrapper stepNumber={1} stepTitle="Le Réveil de la Veille" onBack={onBack} onPause={onPause}>
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
        </div>
      </HifzStepWrapper>
    );
  }

  if (isFirstDay) {
    return (
      <HifzStepWrapper stepNumber={1} stepTitle="Le Réveil de la Veille" onBack={onBack} onPause={onPause}>
        <div className="text-center space-y-6 py-4">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <Sparkles className="h-8 w-8" style={{ color: '#d4af37' }} />
          </div>
          <div className="space-y-3 px-2">
            <h3 className="text-lg font-semibold" style={{ color: '#f0e6c8', fontFamily: "'Playfair Display', serif" }}>
              C'est votre premier jour !
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Cette étape de révision sera active dès demain <span style={{ color: '#d4af37' }}>in shaa Allah</span>, 
              une fois que vous aurez complété votre première session de mémorisation.
            </p>
          </div>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold"
            style={{ background: 'linear-gradient(135deg, #d4af37, #b8962e)', color: '#1a2e1a' }}
          >
            <Check className="h-5 w-5" />
            Passer à l'étape suivante
          </motion.button>
        </div>
      </HifzStepWrapper>
    );
  }

  return (
    <HifzStepWrapper stepNumber={1} stepTitle="Le Réveil de la Veille" onBack={onBack} onPause={onPause}>
      <div className="text-center space-y-5">
        <button
          onClick={handleReset}
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center active:scale-95 transition-transform"
          style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.3)' }}
        >
          <RotateCcw className="h-8 w-8" style={{ color: '#d4af37' }} />
        </button>

        {/* Yesterday's verses info */}
        {yesterdayVerses.length > 0 && (
          <div className="rounded-xl px-4 py-3 space-y-1"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <p className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Acquis d'hier à réviser
            </p>
            {yesterdayVerses.map((v, i) => (
              <p key={i} className="text-sm font-semibold" style={{ color: '#d4af37' }}>
                {v.surahName} — v.{v.verseStart} à {v.verseEnd}
              </p>
            ))}
          </div>
        )}

        <p className="text-white/80 text-sm leading-relaxed px-2">
          Avant d'avancer, consolidons tes acquis. Récite de mémoire, 5 fois, la partie apprise hier.
        </p>

        {/* Timer */}
        <div className="text-3xl font-bold text-white/90 font-mono">
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>

        <AnimatePresence mode="wait">
          {rescueMode ? (
            <motion.div
              key="rescue"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Encouragement banner */}
              <div className="rounded-xl px-4 py-3 text-sm leading-relaxed text-left"
                style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)', color: '#f0e6c8' }}>
                Pas de panique ! Prenez le temps de relire 3 fois pour rafraîchir votre mémoire par la grâce d'Allah (عز وجل).
              </div>

              {/* Arabic text block */}
              {loadingVerses ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="rounded-xl px-5 py-4 text-right space-y-3 max-h-60 overflow-y-auto"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  dir="rtl">
                  {verseTexts.map((ayah) => (
                    <p key={ayah.number}
                      className="leading-[2.1]"
                      style={{
                        fontFamily: "'Amiri', 'Scheherazade New', serif",
                        fontSize: '1.35rem',
                        color: '#f0e6c8',
                        fontVariantLigatures: 'common-ligatures',
                        fontFeatureSettings: '"liga" 1, "calt" 1, "kern" 1',
                      }}>
                      {ayah.text}
                      <span className="inline-block mx-1 text-xs" style={{ color: 'rgba(212,175,55,0.6)' }}>
                        ﴿{ayah.numberInSurah}﴾
                      </span>
                    </p>
                  ))}
                </div>
              )}

              {/* Rescue counter (1-3) */}
              <div className="space-y-3">
                <p className="text-white/50 text-xs uppercase tracking-wider">🔄 Relisez 3 fois avec le texte</p>
                <div className="flex items-center justify-center gap-3">
                  {[1, 2, 3].map(n => (
                    <div
                      key={n}
                      className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                      style={{
                        background: n <= rescueCount ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)',
                        border: `2px solid ${n <= rescueCount ? '#d4af37' : 'rgba(255,255,255,0.1)'}`,
                        color: n <= rescueCount ? '#d4af37' : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {n}
                    </div>
                  ))}
                </div>

                {rescueCount < 3 ? (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRescueCount(prev => prev + 1)}
                    className="px-6 py-2 rounded-xl font-semibold text-sm"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    Lecture terminée
                  </motion.button>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleRescueComplete}
                    className="px-6 py-3 rounded-xl font-semibold text-sm"
                    style={{ background: 'linear-gradient(135deg, #d4af37, #b8962e)', color: '#1a2e1a' }}
                  >
                    ✅ Reprendre les récitations par cœur
                  </motion.button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="normal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {/* Counter */}
              <p className="text-white/50 text-xs uppercase tracking-wider">Récitations</p>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <div
                    key={n}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                    style={{
                      background: n <= count ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)',
                      border: `2px solid ${n <= count ? '#d4af37' : 'rgba(255,255,255,0.1)'}`,
                      color: n <= count ? '#d4af37' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {n}
                  </div>
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setCount(prev => Math.min(prev + 1, 5))}
                disabled={count >= 5}
                className="px-6 py-2 rounded-xl font-semibold text-sm"
                style={{
                  background: count >= 5 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                {count >= 5 ? 'Terminé ✓' : 'Récitation terminée'}
              </motion.button>

              {/* Rescue button — only visible when not done and verses exist */}
              {count < 5 && yesterdayVerses.length > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={activateRescueMode}
                  className="flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-lg text-xs font-medium"
                  style={{ color: 'rgba(255,255,255,0.45)', background: 'transparent' }}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  J'ai oublié une partie
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {count >= 5 && !rescueMode && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold"
            style={{ background: 'linear-gradient(135deg, #d4af37, #b8962e)', color: '#1a2e1a' }}
          >
            <Check className="h-5 w-5" />
            Passer à l'étape suivante
          </motion.button>
        )}
      </div>
    </HifzStepWrapper>
  );
}