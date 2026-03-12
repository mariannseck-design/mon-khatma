import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SURAHS } from '@/lib/surahData';

interface Props {
  surahNumber: number;
  verseStart: number;
  verseEnd: number;
  onNext: () => void;
}

const TIKRAR_TARGET = 40;

export default function StepTikrarFinal({ surahNumber, verseStart, verseEnd, onNext }: Props) {
  const { isAdmin } = useAuth();
  const minTarget = isAdmin ? 1 : TIKRAR_TARGET;
  const [inputValue, setInputValue] = useState('');
  const reps = Math.max(0, Math.min(parseInt(inputValue) || 0, TIKRAR_TARGET));
  const remaining = Math.max(0, minTarget - reps);
  const progress = (reps / minTarget) * 100;
  const surahName = SURAHS.find(s => s.number === surahNumber)?.name || '';

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="space-y-5"
    >
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)' }}>
          <Star className="h-7 w-7 fill-current" style={{ color: '#d4af37' }} />
        </div>
        <h3 className="text-base font-bold" style={{ color: '#f0e6c8', fontFamily: "'Playfair Display', serif" }}>
          Le Compteur Tikrar
        </h3>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {surahName} · Versets {verseStart}-{verseEnd}
        </p>
      </div>

      <div className="rounded-xl px-4 py-3 space-y-2" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
        <p className="text-xs font-medium leading-relaxed text-center" style={{ color: '#d4af37' }}>
          Objectif : {TIKRAR_TARGET} répétitions de mémoire pour l'ensemble du passage du jour.
        </p>
        <p className="text-xs leading-relaxed text-center" style={{ color: 'rgba(212,175,55,0.7)' }}>
          💡 Divisez vos 40 répétitions en 10 sessions de 4 par heure pour rester frais !
        </p>
        <p className="text-xs italic leading-relaxed text-center" style={{ color: 'rgba(212,175,55,0.6)' }}>
          Règle d'or : récitation exclusivement de mémoire. N'ouvrez le Mushaf qu'en cas de doute sérieux, puis refermez-le immédiatement.
        </p>
      </div>

      {/* Circular progress */}
      <div className="flex justify-center">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
            <circle
              cx="50" cy="50" r="44" fill="none"
              stroke={remaining === 0 ? '#d4af37' : 'rgba(212,175,55,0.6)'}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.76} 276`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color: '#d4af37' }}>{reps}</span>
            <span className="text-white/40 text-xs">/ {TIKRAR_TARGET}</span>
          </div>
        </div>
      </div>

      {/* Input for repetitions */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Combien de répétitions avez-vous effectuées ?
        </label>
        <input
          type="number"
          inputMode="numeric"
          min="0"
          max={TIKRAR_TARGET}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="0"
          className="w-full rounded-xl px-4 py-3 text-center text-lg font-bold outline-none"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(212,175,55,0.3)',
            color: '#f0e6c8',
            fontSize: '16px',
          }}
        />
      </div>

      {/* Remaining display */}
      <div className="text-center">
        <span className="text-sm font-medium" style={{ color: remaining === 0 ? '#d4af37' : 'rgba(255,255,255,0.5)' }}>
          Solde restant : <span className="font-bold text-lg" style={{ color: remaining === 0 ? '#d4af37' : '#f0e6c8' }}>{remaining}</span>
        </span>
      </div>

      {remaining === 0 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #d4af37, #b8962e)', color: '#1a2e1a', boxShadow: '0 4px 15px rgba(212,175,55,0.3)' }}
        >
          <Check className="h-5 w-5" />
          Valider — Allahumma barik
        </motion.button>
      )}
    </motion.div>
  );
}
