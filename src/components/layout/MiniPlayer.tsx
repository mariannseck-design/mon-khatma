import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Pause, X, BookOpen } from 'lucide-react';
import { useGlobalAudio } from '@/contexts/AudioContext';
import { getExactVersePage } from '@/lib/quranData';
import { motion, AnimatePresence } from 'framer-motion';

export default function MiniPlayer() {
  const { status, trackInfo, pause, resume, stop } = useGlobalAudio();
  const navigate = useNavigate();
  const location = useLocation();

  const isVisible = status !== 'idle' && trackInfo !== null;
  const isOnQuranReader = location.pathname === '/quran-reader';
  const isOnReturnPage = trackInfo && location.pathname === trackInfo.returnPath && !isOnQuranReader;

  const handleOpenMushaf = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!trackInfo?.surahNumber) return;
    const page = await getExactVersePage(trackInfo.surahNumber, trackInfo.startVerse || 1);
    navigate(`/quran-reader?page=${page}`);
  };

  return (
    <AnimatePresence>
      {isVisible && !isOnReturnPage && (
        <motion.div
          key="mini-player"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-[5.5rem] left-3 right-3 z-50 mx-auto max-w-lg"
        >
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-md"
            style={{
              background: 'rgba(26,46,26,0.94)',
              border: '1px solid rgba(212,175,55,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
            onClick={() => trackInfo && navigate(trackInfo.returnPath)}
            role="button"
            tabIndex={0}
          >
            {/* Audio wave indicator */}
            <div className="flex items-end gap-[3px] h-4">
              {[10, 14, 8, 12].map((h, i) => (
                <motion.span
                  key={i}
                  className="w-[3px] rounded-full"
                  style={{ background: '#d4af37' }}
                  animate={
                    status === 'playing'
                      ? { height: [h * 0.4, h, h * 0.4] }
                      : { height: h * 0.5 }
                  }
                  transition={
                    status === 'playing'
                      ? { duration: 0.7, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }
                      : { duration: 0.3 }
                  }
                />
              ))}
            </div>

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: '#d4af37' }}>
                {trackInfo?.label || 'Lecture en cours'}
              </p>
              <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Appuyer pour revenir
              </p>
            </div>

            {/* Mushaf button */}
            {trackInfo?.surahNumber && (
              <button
                onClick={handleOpenMushaf}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.3)' }}
                title="Ouvrir le Mushaf"
              >
                <BookOpen className="h-3.5 w-3.5" style={{ color: '#059669' }} />
              </button>
            )}

            {/* Play / Pause */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                status === 'playing' ? pause() : resume();
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.35)' }}
            >
              {status === 'playing'
                ? <Pause className="h-4 w-4" style={{ color: '#d4af37' }} />
                : <Play className="h-4 w-4 ml-0.5" style={{ color: '#d4af37' }} />
              }
            </button>

            {/* Stop */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                stop();
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <X className="h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
