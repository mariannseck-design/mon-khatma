import { useState } from 'react';
import { BookOpen, ChevronDown, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { SURAHS } from '@/lib/surahData';

const REPETITION_LEVELS = [
  { value: 15, label: 'Hifz 15', subtitle: 'Niveau Découverte', desc: 'Un rythme doux, idéal pour débuter ou pour les journées très chargées.' },
  { value: 20, label: 'Hifz 20', subtitle: 'Niveau Régulier', desc: 'Le juste équilibre pour une progression constante et harmonieuse.' },
  { value: 25, label: 'Hifz 25', subtitle: 'Niveau Soutenu', desc: 'Une intensité renforcée pour mieux fixer les versets complexes.' },
  { value: 30, label: 'Hifz 30', subtitle: 'Niveau Intense', desc: 'Un engagement profond pour une mémorisation qui s\'ancre durablement dans le cœur.' },
  { value: 35, label: 'Hifz 35', subtitle: 'Niveau Maîtrise', desc: 'Une préparation exigeante pour atteindre une fluidité de récitation exemplaire.' },
  { value: 40, label: 'Hifz 40', subtitle: 'Niveau Expert', desc: 'L\'ancrage total. La voie de l\'excellence pour graver chaque lettre de façon indélébile.' },
];

interface HifzConfigProps {
  onStart: (config: { surahNumber: number; startVerse: number; endVerse: number; repetitionLevel: number }) => void;
}

export default function HifzConfig({ onStart }: HifzConfigProps) {
  const [surahNumber, setSurahNumber] = useState(114);
  const [startVerse, setStartVerse] = useState(1);
  const [endVerse, setEndVerse] = useState(6);
  const [repetitionLevel, setRepetitionLevel] = useState(20);
  const [showSurahList, setShowSurahList] = useState(false);

  const selectedSurah = SURAHS.find(s => s.number === surahNumber);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1
          className="text-2xl font-bold tracking-[0.1em] uppercase"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}
        >
          Choisis ton ancrage
        </h1>
        <p className="text-white/70 text-sm">
          Prépare ta session de mémorisation avec soin
        </p>
      </div>

      {/* Surah selector */}
      <div
        className="rounded-2xl p-4 cursor-pointer"
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(212,175,55,0.3)',
        }}
        onClick={() => setShowSurahList(!showSurahList)}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Sourate</p>
            <p className="text-white font-semibold text-lg">
              {selectedSurah ? `${selectedSurah.number}. ${selectedSurah.name}` : 'Choisir...'}
            </p>
          </div>
          <ChevronDown className={`h-5 w-5 text-white/50 transition-transform ${showSurahList ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {showSurahList && (
        <div
          className="rounded-2xl max-h-60 overflow-y-auto"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(212,175,55,0.2)',
          }}
        >
          {SURAHS.map(s => (
            <button
              key={s.number}
              className="w-full text-left px-4 py-2.5 text-white/80 hover:bg-white/10 transition-colors text-sm"
              onClick={() => {
                setSurahNumber(s.number);
                setStartVerse(1);
                setEndVerse(Math.min(6, 286)); // will adjust
                setShowSurahList(false);
              }}
            >
              <span className="text-white/40 mr-2">{s.number}.</span>
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Verse range */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(212,175,55,0.3)',
          }}
        >
          <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Verset début</p>
          <input
            type="number"
            min={1}
            value={startVerse}
            onChange={e => setStartVerse(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full bg-transparent text-white text-2xl font-bold outline-none text-center"
            style={{ fontSize: '16px' }}
          />
        </div>
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(212,175,55,0.3)',
          }}
        >
          <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Verset fin</p>
          <input
            type="number"
            min={startVerse}
            value={endVerse}
            onChange={e => setEndVerse(Math.max(startVerse, parseInt(e.target.value) || startVerse))}
            className="w-full bg-transparent text-white text-2xl font-bold outline-none text-center"
            style={{ fontSize: '16px' }}
          />
        </div>
      </div>

      {/* Repetition level */}
      <div className="space-y-3">
        <p className="text-white/50 text-xs uppercase tracking-wider">Niveau d'ancrage</p>
        <div className="grid grid-cols-3 gap-2">
          {REPETITION_LEVELS.map(level => (
            <button
              key={level.value}
              onClick={() => setRepetitionLevel(level.value)}
              className="rounded-xl p-3 text-center transition-all"
              style={{
                background: repetitionLevel === level.value
                  ? 'rgba(212,175,55,0.25)'
                  : 'rgba(255,255,255,0.06)',
                border: `1px solid ${repetitionLevel === level.value ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              <p className="text-white font-bold text-sm">{level.label}</p>
              <p className="text-white/40 text-[10px]">{level.subtitle}</p>
            </button>
          ))}
        </div>
        {/* Description of selected level */}
        <motion.p
          key={repetitionLevel}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white/60 text-xs text-center italic px-4"
        >
          {REPETITION_LEVELS.find(l => l.value === repetitionLevel)?.desc}
        </motion.p>
      </div>

      {/* Start button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onStart({ surahNumber, startVerse, endVerse, repetitionLevel })}
        className="w-full rounded-2xl py-4 flex items-center justify-center gap-3 font-bold text-lg"
        style={{
          background: 'linear-gradient(135deg, #d4af37, #b8962e)',
          color: '#1a2e1a',
          boxShadow: '0 4px 20px rgba(212,175,55,0.3)',
        }}
      >
        <Play className="h-5 w-5" />
        Commencer l'ancrage
      </motion.button>
    </div>
  );
}
