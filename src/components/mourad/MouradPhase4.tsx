import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Check, Plus } from 'lucide-react';
import { SURAHS } from '@/lib/surahData';

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  repetitionCount: number;
  onAddRepetitions: (count: number) => void;
  onValidate: () => void;
}

export default function MouradPhase4({ surahNumber, startVerse, endVerse, repetitionCount, onAddRepetitions, onValidate }: Props) {
  const [inputValue, setInputValue] = useState('');
  const target = 40;
  const remaining = Math.max(0, target - repetitionCount);
  const progress = Math.min(100, (repetitionCount / target) * 100);
  const surah = SURAHS.find(s => s.number === surahNumber);

  const handleAdd = () => {
    const val = parseInt(inputValue);
    if (!val || val < 1) return;
    onAddRepetitions(val);
    setInputValue('');
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(5,150,105,0.1)', color: '#059669' }}>
          <Target className="h-3.5 w-3.5" />
          Phase 4 — Ancrage des 40
        </div>
        <h2 className="text-lg font-bold text-gray-800">{surah?.name} · v.{startVerse}-{endVerse}</h2>
        <p className="text-gray-500 text-xs">Récite 40 fois de mémoire (Mushaf fermé)</p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center space-y-4">
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(5,150,105,0.1)" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="#059669" strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-800">{repetitionCount}</span>
            <span className="text-xs text-gray-400">/ {target}</span>
          </div>
        </div>

        {remaining > 0 ? (
          <p className="text-sm" style={{ color: '#059669' }}>
            🎯 Plus que <strong>{remaining}</strong> fois avant l'ancrage final !
          </p>
        ) : (
          <p className="text-sm font-semibold" style={{ color: '#059669' }}>
            ✨ Les 40 récitations sont atteintes !
          </p>
        )}

        {/* Progress bar */}
        <div className="w-full h-3 rounded-full" style={{ background: 'rgba(5,150,105,0.1)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #059669, #10B981)' }} />
        </div>
      </div>

      {/* Input to add repetitions */}
      {remaining > 0 && (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs mb-2">Combien viens-tu de réciter ?</p>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={inputValue}
              onChange={e => setInputValue(e.target.value.replace(/\D/g, ''))}
              placeholder="Ex : 5"
              className="flex-1 rounded-xl px-4 py-3 text-center text-lg font-bold text-gray-800 outline-none border border-gray-200 focus:border-emerald-400"
              style={{ fontSize: '16px' }}
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAdd}
              className="rounded-xl px-5 py-3 font-semibold text-white flex items-center gap-1"
              style={{ background: '#059669' }}
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </motion.button>
          </div>
        </div>
      )}

      {/* Quick buttons */}
      {remaining > 0 && (
        <div className="flex gap-2 justify-center">
          {[1, 3, 5, 10].map(n => (
            <button
              key={n}
              onClick={() => onAddRepetitions(n)}
              className="rounded-xl px-4 py-2 text-sm font-medium transition-all"
              style={{ background: 'rgba(5,150,105,0.1)', color: '#059669' }}
            >
              +{n}
            </button>
          ))}
        </div>
      )}

      {/* Validate */}
      {repetitionCount >= target && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={onValidate}
          className="w-full rounded-2xl py-4 flex items-center justify-center gap-3 font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #059669, #10B981)', boxShadow: '0 4px 20px rgba(5,150,105,0.3)' }}
        >
          <Check className="h-5 w-5" />
          Lancer la phase de maintenance
        </motion.button>
      )}
    </div>
  );
}
