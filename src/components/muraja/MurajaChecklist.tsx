import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, ThumbsUp, Crown, BookOpen, Info } from 'lucide-react';
import { SURAHS } from '@/lib/surahData';

interface ChecklistItem {
  id: string;
  surah_number: number;
  verse_start: number;
  verse_end: number;
  sm2_interval?: number;
}

interface MurajaChecklistProps {
  items: ChecklistItem[];
  section: 'rabt' | 'tour';
  checkedIds: string[];
  onCheck: (id: string) => void;
  onRate?: (id: string, quality: number, ratingKey: string) => void;
  isCapActive?: boolean;
  totalDue?: number;
}

const RATINGS = [
  { key: 'hard', label: 'Difficile', quality: 2, icon: Zap, color: '#9B1C31' },
  { key: 'good', label: 'Moyen', quality: 4, icon: ThumbsUp, color: '#D97706' },
  { key: 'easy', label: 'Facile', quality: 5, icon: Crown, color: '#065F46' },
] as const;

export default function MurajaChecklist({
  items,
  section,
  checkedIds,
  onCheck,
  onRate,
  isCapActive,
  totalDue,
}: MurajaChecklistProps) {
  const [ratingFor, setRatingFor] = useState<string | null>(null);

  const getSurahName = (num: number) =>
    SURAHS.find(s => s.number === num)?.name || `Sourate ${num}`;

  const handleCheck = (id: string) => {
    if (checkedIds.includes(id)) return;
    if (section === 'tour') {
      setRatingFor(id);
    } else {
      onCheck(id);
    }
  };

  const handleRate = (quality: number, ratingKey: string) => {
    if (!ratingFor || !onRate) return;
    onRate(ratingFor, quality, ratingKey);
    onCheck(ratingFor);
    setRatingFor(null);
  };

  if (items.length === 0) {
    return (
      <div
        className="rounded-2xl p-5 text-center"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E6F0ED',
          boxShadow: '0 4px 20px rgba(6,95,70,0.06)',
        }}
      >
        <BookOpen className="h-6 w-6 mx-auto mb-2" style={{ color: '#D4AF37' }} />
        <p className="text-sm font-medium" style={{ color: 'rgba(28,36,33,0.65)' }}>
          {section === 'rabt'
            ? 'Aucun acquis récent (< 30 jours)'
            : "Aucune révision planifiée aujourd'hui"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Cap message */}
      {isCapActive && totalDue && (
        <div
          className="flex items-start gap-2 rounded-xl px-3 py-2 text-xs"
          style={{
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.25)',
            color: '#D4AF37',
          }}
        >
          <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span>Révision plafonnée à 10 blocs aujourd'hui ({totalDue} dus au total). Le reste est reporté.</span>
        </div>
      )}

      {items.map((item) => {
        const isChecked = checkedIds.includes(item.id);
        const isRating = ratingFor === item.id;

        return (
          <div key={item.id}>
            <motion.button
              onClick={() => handleCheck(item.id)}
              disabled={isChecked}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all"
              style={{
                background: isChecked ? '#F0F7F4' : '#FFFFFF',
                border: `1px solid ${isChecked ? '#D4AF37' : '#E6F0ED'}`,
                opacity: isChecked ? 0.8 : 1,
                boxShadow: isChecked ? 'none' : '0 2px 8px rgba(6,95,70,0.04)',
              }}
              whileTap={isChecked ? {} : { scale: 0.98 }}
            >
              {/* Checkbox */}
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: isChecked ? '#D4AF37' : 'transparent',
                  border: `2px solid ${isChecked ? '#D4AF37' : '#065F46'}`,
                }}
              >
                {isChecked && <Check className="h-3.5 w-3.5" style={{ color: '#FFFFFF' }} />}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm truncate"
                  style={{
                    color: isChecked ? '#065F46' : '#1C2421',
                    fontWeight: isChecked ? 700 : 600,
                  }}
                >
                  {getSurahName(item.surah_number)}
                </p>
                <p className="text-xs font-medium" style={{ color: 'rgba(28,36,33,0.6)' }}>
                  v. {item.verse_start} → {item.verse_end}
                  {section === 'tour' && item.sm2_interval != null && (
                    <span className="ml-2 opacity-60">· {item.sm2_interval}j</span>
                  )}
                </p>
              </div>
            </motion.button>

            {/* Inline rating for Tour */}
            <AnimatePresence>
              {isRating && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 px-2 py-2">
                    {RATINGS.map(({ key, label, quality, icon: Icon, color }) => (
                      <button
                        key={key}
                        onClick={() => handleRate(quality, key)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition-all"
                        style={{
                          background: `${color}12`,
                          color,
                          border: `1px solid ${color}30`,
                        }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
