import { useState } from 'react';
import { ChevronDown, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { SURAHS } from '@/lib/surahData';

interface MouradConfigProps {
  onStart: (config: { surahNumber: number; startVerse: number; endVerse: number }) => void;
}

export default function MouradConfig({ onStart }: MouradConfigProps) {
  const [surahNumber, setSurahNumber] = useState(114);
  const [startVerse, setStartVerse] = useState(1);
  const [endVerse, setEndVerse] = useState(6);
  const [showSurahList, setShowSurahList] = useState(false);

  const selectedSurah = SURAHS.find(s => s.number === surahNumber);
  const maxVerse = selectedSurah?.versesCount ?? 999;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">
          Méthode Oustaz Mourad
        </h1>
        <p className="text-gray-500 text-sm">
          Un parcours structuré pour une mémorisation solide
        </p>
      </div>

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

      {/* Start button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onStart({ surahNumber, startVerse, endVerse })}
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
