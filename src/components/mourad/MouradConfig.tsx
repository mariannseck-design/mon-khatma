import { useState, useEffect } from 'react';
import { ChevronDown, Play, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { SURAHS } from '@/lib/surahData';
import { findNextStartingPoint } from '@/lib/hifzUtils';
import { getPageAyahs } from '@/lib/quranData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface MouradConfigProps {
  onStart: (config: { surahNumber: number; startVerse: number; endVerse: number }) => void;
}

export default function MouradConfig({ onStart }: MouradConfigProps) {
  const { user } = useAuth();
  const [selectionMode, setSelectionMode] = useState<'surah' | 'page'>('surah');
  const [surahNumber, setSurahNumber] = useState(114);
  const [startVerse, setStartVerse] = useState(1);
  const [endVerse, setEndVerse] = useState(6);
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const [showSurahList, setShowSurahList] = useState(false);
  const [suggestedPoint, setSuggestedPoint] = useState<string | null>(null);
  const [completedSessions, setCompletedSessions] = useState<{ surah_number: number; verse_start: number; verse_end: number }[]>([]);

  // Auto-suggest next starting point
  useEffect(() => {
    if (!user) return;
    findNextStartingPoint(user.id).then(point => {
      if (point) {
        setSurahNumber(point.surahNumber);
        setStartVerse(point.startVerse);
        setEndVerse(point.endVerse);
        setSuggestedPoint(point.surahName);
      }
    });
  }, [user]);

  // Load completed sessions
  useEffect(() => {
    if (!user) return;
    supabase
      .from('mourad_sessions')
      .select('surah_number, verse_start, verse_end')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setCompletedSessions(data);
      });
  }, [user]);

  const selectedSurah = SURAHS.find(s => s.number === surahNumber);
  const maxVerse = selectedSurah?.versesCount ?? 999;

  const handleStart = async () => {
    if (selectionMode === 'page') {
      const allAyahs = [];
      for (let p = startPage; p <= endPage; p++) {
        const ayahs = await getPageAyahs(p);
        allAyahs.push(...ayahs);
      }
      if (allAyahs.length === 0) return;
      const firstAyah = allAyahs[0];
      const lastAyah = allAyahs[allAyahs.length - 1];
      if (firstAyah.surah.number === lastAyah.surah.number) {
        onStart({ surahNumber: firstAyah.surah.number, startVerse: firstAyah.numberInSurah, endVerse: lastAyah.numberInSurah });
      } else {
        const firstSurahAyahs = allAyahs.filter(a => a.surah.number === firstAyah.surah.number);
        onStart({ surahNumber: firstAyah.surah.number, startVerse: firstSurahAyahs[0].numberInSurah, endVerse: firstSurahAyahs[firstSurahAyahs.length - 1].numberInSurah });
      }
    } else {
      onStart({ surahNumber, startVerse, endVerse });
    }
  };

  const getSurahName = (num: number) => SURAHS.find(s => s.number === num)?.name || `Sourate ${num}`;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">
          Méthode Oustaz Mourad
        </h1>
        <p className="text-gray-500 text-sm">
          Un parcours structuré pour une mémorisation solide
        </p>
        {suggestedPoint && (
          <p className="text-xs mt-1 text-emerald-600">
            💡 Suggestion : continuer avec {suggestedPoint}
          </p>
        )}
      </div>

      {/* Selection mode toggle */}
      <div className="grid grid-cols-2 gap-2">
        {(['surah', 'page'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setSelectionMode(mode)}
            className={`rounded-xl py-2.5 text-center transition-all text-sm font-semibold border ${
              selectionMode === mode
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-gray-100 text-gray-400'
            }`}
          >
            {mode === 'surah' ? 'Sourate' : 'Page'}
          </button>
        ))}
      </div>

      {selectionMode === 'surah' ? (
        <>
          {/* Surah selector */}
          <div
            className="bg-white rounded-3xl p-4 cursor-pointer shadow-sm border border-gray-100"
            onClick={() => setShowSurahList(!showSurahList)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Sourate</p>
                <p className="text-gray-800 font-semibold text-lg">
                  {selectedSurah ? `${selectedSurah.number}. ${selectedSurah.name}` : 'Choisir...'}
                </p>
              </div>
              <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${showSurahList ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {showSurahList && (
            <div className="bg-white rounded-3xl max-h-60 overflow-y-auto shadow-sm border border-gray-100">
              {SURAHS.map(s => (
                <button
                  key={s.number}
                  className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-emerald-50 transition-colors text-sm"
                  onClick={() => {
                    setSurahNumber(s.number);
                    setStartVerse(1);
                    setEndVerse(Math.min(6, s.versesCount));
                    setShowSurahList(false);
                  }}
                >
                  <span className="text-gray-400 mr-2">{s.number}.</span>
                  {s.name}
                  <span className="text-gray-300 ml-2 text-xs">{s.nameFr}</span>
                </button>
              ))}
            </div>
          )}

          {/* Verse range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Verset début</p>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={startVerse === 0 ? '' : startVerse}
                onFocus={e => e.target.select()}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  setStartVerse(val === '' ? 0 : parseInt(val));
                }}
                onBlur={() => setStartVerse(prev => Math.min(maxVerse, Math.max(1, prev)))}
                className="w-full bg-transparent text-gray-800 text-2xl font-bold outline-none text-center [appearance:textfield]"
                style={{ fontSize: '16px' }}
              />
            </div>
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Verset fin</p>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={endVerse === 0 ? '' : endVerse}
                onFocus={e => e.target.select()}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  setEndVerse(val === '' ? 0 : parseInt(val));
                }}
                onBlur={() => setEndVerse(prev => Math.min(maxVerse, Math.max(startVerse, prev || startVerse)))}
                className="w-full bg-transparent text-gray-800 text-2xl font-bold outline-none text-center [appearance:textfield]"
                style={{ fontSize: '16px' }}
              />
            </div>
          </div>
        </>
      ) : (
        /* Page mode */
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Page début</p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={startPage === 0 ? '' : startPage}
              onFocus={e => e.target.select()}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setStartPage(val === '' ? 0 : parseInt(val));
              }}
              onBlur={() => {
                const clamped = Math.min(604, Math.max(1, startPage));
                setStartPage(clamped);
                setEndPage(prev => Math.max(prev, clamped));
              }}
              className="w-full bg-transparent text-gray-800 text-2xl font-bold outline-none text-center [appearance:textfield]"
              style={{ fontSize: '16px' }}
            />
          </div>
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Page fin</p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={endPage === 0 ? '' : endPage}
              onFocus={e => e.target.select()}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setEndPage(val === '' ? 0 : parseInt(val));
              }}
              onBlur={() => setEndPage(prev => Math.min(604, Math.max(startPage, prev || startPage)))}
              className="w-full bg-transparent text-gray-800 text-2xl font-bold outline-none text-center [appearance:textfield]"
              style={{ fontSize: '16px' }}
            />
          </div>
          <p className="col-span-2 text-gray-400 text-xs text-center">
            Pages 1 à 604 — Pour une seule page, mettez la même valeur
          </p>
        </div>
      )}

      {/* Completed sessions history */}
      {completedSessions.length > 0 && (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">✅ Déjà mémorisé</p>
          <div className="flex flex-wrap gap-1.5">
            {completedSessions.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1">
                <CheckCircle2 className="h-3 w-3" />
                {getSurahName(s.surah_number)} v.{s.verse_start}-{s.verse_end}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Start button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleStart}
        className="w-full rounded-2xl py-4 flex items-center justify-center gap-3 font-bold text-lg text-white"
        style={{
          background: 'linear-gradient(135deg, #059669, #10B981)',
          boxShadow: '0 4px 20px rgba(5,150,105,0.3)',
        }}
      >
        <Play className="h-5 w-5" />
        Commencer le cycle
      </motion.button>
    </div>
  );
}
