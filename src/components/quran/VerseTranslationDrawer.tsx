import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Loader2, Play, Pause, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { VerseLineInfo } from './ImageVerseOverlay';

interface TranslationData {
  arabic: string;
  translation: string;
}

interface Props {
  verseKey: string | null;
  allVerses: VerseLineInfo[];
  onClose: () => void;
  onNavigate: (verseKey: string) => void;
}

export default function VerseTranslationDrawer({ verseKey, allVerses, onClose, onNavigate }: Props) {
  const { user } = useAuth();
  const [data, setData] = useState<TranslationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // Audio state
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reciter = localStorage.getItem('quran_reciter') || 'ar.alafasy';

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current = null;
    }
    setAudioPlaying(false);
    setAudioLoading(false);
  }, []);

  // Stop audio when verse changes or drawer closes
  useEffect(() => {
    stopAudio();
  }, [verseKey, stopAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopAudio(); };
  }, [stopAudio]);

  const playVerse = useCallback(async () => {
    if (!verseKey) return;
    if (audioPlaying) { stopAudio(); return; }

    setAudioLoading(true);
    try {
      const [surah, ayah] = verseKey.split(':');
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${reciter}`);
      const json = await res.json();
      if (json.code !== 200) throw new Error('API error');

      const audioUrl = json.data.audio;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => { setAudioPlaying(false); };
      audio.onerror = () => { setAudioPlaying(false); setAudioLoading(false); };
      audio.oncanplaythrough = () => { setAudioLoading(false); };

      await audio.play();
      setAudioPlaying(true);
    } catch {
      setAudioLoading(false);
    }
  }, [verseKey, audioPlaying, stopAudio, reciter]);

  useEffect(() => {
    if (!verseKey) { setData(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(false);

    const fetchTranslation = async () => {
      try {
        const res = await fetch(
          `https://api.quran.com/api/v4/verses/by_key/${verseKey}?language=fr&words=true&translations=136&word_fields=text_uthmani`
        );
        if (!res.ok) throw new Error('API error');
        const json = await res.json();
        if (cancelled) return;

        const verse = json.verse;
        const arabic = verse.words
          .filter((w: any) => w.char_type_name !== 'end')
          .map((w: any) => w.text_uthmani)
          .join(' ');
        const translation = verse.translations?.[0]?.text?.replace(/<[^>]*>/g, '') || '';

        setData({ arabic, translation });
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTranslation();
    return () => { cancelled = true; };
  }, [verseKey]);

  // Check if verse is favorited
  useEffect(() => {
    if (!verseKey || !user) { setIsFavorite(false); return; }
    const check = async () => {
      const { data: fav } = await supabase
        .from('favorite_verses')
        .select('id')
        .eq('user_id', user.id)
        .eq('verse_key', verseKey)
        .maybeSingle();
      setIsFavorite(!!fav);
    };
    check();
  }, [verseKey, user]);

  const toggleFavorite = async () => {
    if (!verseKey || !user || favLoading) return;
    setFavLoading(true);
    const [surah, verse] = verseKey.split(':').map(Number);
    
    if (isFavorite) {
      await supabase.from('favorite_verses').delete().eq('user_id', user.id).eq('verse_key', verseKey);
      setIsFavorite(false);
    } else {
      await supabase.from('favorite_verses').insert({
        user_id: user.id,
        surah_number: surah,
        verse_number: verse,
        verse_key: verseKey,
        arabic_text: data?.arabic || null,
        translation_text: data?.translation || null,
      });
      setIsFavorite(true);
    }
    setFavLoading(false);
  };

  const currentIdx = allVerses.findIndex(v => v.verseKey === verseKey);
  const canPrev = currentIdx > 0;
  const canNext = currentIdx < allVerses.length - 1;

  const handlePrev = () => {
    if (canPrev) onNavigate(allVerses[currentIdx - 1].verseKey);
  };
  const handleNext = () => {
    if (canNext) onNavigate(allVerses[currentIdx + 1].verseKey);
  };

  return (
    <AnimatePresence>
      {verseKey && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-40 rounded-t-2xl shadow-2xl"
          style={{
            background: '#f5e6c8',
            borderTop: '1px solid rgba(181,148,46,0.25)',
            maxHeight: '55vh',
          }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(181,148,46,0.35)' }} />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={!canPrev}
                className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-25"
                style={{ color: '#1a1a1a' }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>
                {verseKey && `Verset ${verseKey.replace(':', ' : ')}`}
              </span>
              <button
                onClick={handleNext}
                disabled={!canNext}
                className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-25"
                style={{ color: '#1a1a1a' }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-1">
              {/* Play button */}
              <button
                onClick={playVerse}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{
                  background: audioPlaying ? '#b5942e' : 'rgba(181,148,46,0.15)',
                  color: audioPlaying ? '#fff' : '#1a1a1a',
                }}
              >
                {audioLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : audioPlaying ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5 ml-0.5" />
                )}
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ color: '#1a1a1a' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(55vh - 70px)' }}>
            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#7a8b6f' }} />
              </div>
            )}
            {error && (
              <p className="text-center text-sm py-4" style={{ color: '#8a6d1b' }}>
                Impossible de charger la traduction
              </p>
            )}
            {data && !loading && (
              <>
                {/* Arabic */}
                <p
                  className="text-right leading-loose mb-4 font-arabic"
                  style={{ fontSize: '24px', color: '#1a1a1a', fontFamily: "'Scheherazade New', 'Amiri', serif" }}
                  dir="rtl"
                >
                  {data.arabic}
                </p>
                {/* Translation */}
                <p className="text-sm leading-relaxed" style={{ color: '#2a2a2a' }}>
                  {data.translation}
                </p>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
