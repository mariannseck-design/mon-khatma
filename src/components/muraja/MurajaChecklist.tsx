import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, ThumbsUp, Crown, BookOpen, Info, CalendarDays, PartyPopper } from 'lucide-react';
import { SURAHS } from '@/lib/surahData';

interface ChecklistItem {
  id: string;
  surah_number: number;
  verse_start: number;
  verse_end: number;
  sm2_interval?: number;
  liaison_start_date?: string | null;
}

interface NextReview {
  surah_number: number;
  verse_start: number;
  verse_end: number;
  next_review_date: string;
}

interface MurajaChecklistProps {
  items: ChecklistItem[];
  section: 'rabt' | 'tour';
  checkedIds: string[];
  onCheck: (id: string) => void;
  onRate?: (id: string, quality: number, ratingKey: string) => void;
  isCapActive?: boolean;
  totalDue?: number;
  hasTourBlocks?: boolean;
  firstArrivalDate?: string;
  nextTourReviews?: NextReview[];
}

const RATINGS = [
  { key: 'hard', label: 'Difficile', quality: 2, icon: Zap, colorVar: '--p-hard' },
  { key: 'good', label: 'Moyen', quality: 4, icon: ThumbsUp, colorVar: '--p-medium' },
  { key: 'easy', label: 'Facile', quality: 5, icon: Crown, colorVar: '--p-primary' },
] as const;

function humanizeInterval(days?: number): string {
  if (days == null) return '';
  if (days <= 1) return 'À réviser aujourd\'hui';
  if (days === 2) return 'Prévu demain';
  return `Dans ${days} jours`;
}

function getLiaisonDaysPassed(startDate?: string | null): number {
  if (!startDate) return 0;
  const start = new Date(startDate + 'T00:00:00');
  const now = new Date();
  return Math.min(30, Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000)));
}

export default function MurajaChecklist({
  items,
  section,
  checkedIds,
  onCheck,
  onRate,
  isCapActive,
  totalDue,
  hasTourBlocks,
  firstArrivalDate,
  nextTourReviews,
}: MurajaChecklistProps) {
  const [ratingFor, setRatingFor] = useState<string | null>(null);

  const getSurahName = (num: number) =>
    SURAHS.find(s => s.number === num)?.name || `Sourate ${num}`;

  const handleValidate = (id: string) => {
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
    // Tour section: distinguish "all done today" vs "no tour blocks at all"
    if (section === 'tour' && hasTourBlocks) {
      return (
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            background: 'var(--p-card)',
            border: '1px solid var(--p-border)',
            boxShadow: 'var(--p-card-shadow)',
          }}
        >
          <PartyPopper className="h-6 w-6 mx-auto mb-2" style={{ color: '#D4AF37' }} />
          <p className="text-sm font-bold" style={{ color: 'var(--p-primary)' }}>
            Alhamdulillah, tu as terminé tes révisions pour aujourd'hui !
          </p>
        </div>
      );
    }

    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{
          background: 'var(--p-card)',
          border: '1px solid var(--p-border)',
          boxShadow: 'var(--p-card-shadow)',
        }}
      >
        <BookOpen className="h-6 w-6 mx-auto mb-2" style={{ color: 'var(--p-accent)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--p-text-65)' }}>
          {section === 'rabt'
            ? 'Aucun acquis récent (< 30 jours)'
            : "Aucune révision planifiée aujourd'hui"}
        </p>
        {section === 'tour' && (
          <>
            <p className="text-xs mt-1.5" style={{ color: 'var(--p-text-50)' }}>
              Tes portions mémorisées arriveront ici après 30 jours de liaison (Ar-Rabt).
            </p>
            {firstArrivalDate && (() => {
              const arrival = new Date(firstArrivalDate + 'T00:00:00');
              arrival.setDate(arrival.getDate() + 30);
              const formatted = arrival.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
              const daysLeft = Math.max(0, Math.ceil((arrival.getTime() - Date.now()) / 86400000));
              return (
                <div className="flex items-center gap-1.5 mt-2 justify-center">
                  <CalendarDays className="h-3.5 w-3.5" style={{ color: 'var(--p-accent)' }} />
                  <p className="text-xs font-semibold" style={{ color: 'var(--p-accent)' }}>
                    Premier bloc estimé le {formatted} ({daysLeft > 0 ? `dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}` : "aujourd'hui"})
                  </p>
                </div>
              );
            })()}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* Cap message */}
      {isCapActive && totalDue && (
        <div
          className="flex items-start gap-2 rounded-xl px-4 py-2.5 text-xs"
          style={{
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.25)',
            color: 'var(--p-accent)',
          }}
        >
          <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span>Révision plafonnée à 10 blocs aujourd'hui ({totalDue} dus au total). Le reste est reporté.</span>
        </div>
      )}

      {items.map((item) => {
        const isChecked = checkedIds.includes(item.id);
        const isRating = ratingFor === item.id;
        const daysPassed = section === 'rabt' ? getLiaisonDaysPassed(item.liaison_start_date) : 0;

        return (
          <div key={item.id}>
            <div
              className="w-full rounded-xl px-4 py-3.5 transition-all"
              style={{
                background: isChecked ? 'var(--p-card-active)' : 'var(--p-card)',
                border: `1px solid ${isChecked ? '#D4AF37' : 'var(--p-border)'}`,
                borderLeft: section === 'rabt' ? '3px solid #D4AF37' : undefined,
                opacity: isChecked ? 0.8 : 1,
                boxShadow: isChecked ? 'none' : 'var(--p-card-shadow)',
              }}
            >
              {/* Label */}
              <div className="flex items-center gap-3">
                {/* Checkbox indicator */}
                <motion.div
                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: isChecked ? '#D4AF37' : 'transparent',
                    border: `2px solid ${isChecked ? '#D4AF37' : 'var(--p-checkbox-border)'}`,
                  }}
                  animate={isChecked ? { scale: [1, 1.25, 1] } : {}}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  {isChecked && <Check className="h-3.5 w-3.5" style={{ color: '#FFFFFF' }} />}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm truncate"
                    style={{
                      color: isChecked ? 'var(--p-primary)' : 'var(--p-text)',
                      fontWeight: isChecked ? 800 : 700,
                    }}
                  >
                    {getSurahName(item.surah_number)}
                  </p>
                  <p className="text-xs font-medium" style={{ color: 'var(--p-text-60)' }}>
                    v. {item.verse_start} → {item.verse_end}
                    {section === 'tour' && (
                      isChecked
                        ? <span className="ml-2 font-bold" style={{ color: '#10B981' }}>· Révision faite ✓</span>
                        : item.sm2_interval != null
                          ? <span className="ml-2 opacity-80">· {humanizeInterval(item.sm2_interval)}</span>
                          : null
                    )}
                    {section === 'rabt' && (
                      <span className="ml-2 opacity-80">· Jour {daysPassed} / 30</span>
                    )}
                  </p>

                  {/* Mini progress bar for rabt */}
                  {section === 'rabt' && item.liaison_start_date && (
                    <div className="w-full h-2 rounded-full overflow-hidden mt-1.5" style={{ background: 'var(--p-track)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #065F46, #10B981)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(daysPassed / 30) * 100}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Validation button */}
              {!isChecked && !isRating && (
                <motion.button
                  onClick={() => handleValidate(item.id)}
                  className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #065F46, #10B981)',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 8px -2px rgba(16, 185, 129, 0.4)',
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  Bismillah, je valide ma révision
                </motion.button>
              )}
            </div>

            {/* Inline rating for Tour */}
            <AnimatePresence>
              {isRating && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 px-2 py-2.5">
                    {RATINGS.map(({ key, label, quality, icon: Icon, colorVar }) => (
                      <button
                        key={key}
                        onClick={() => handleRate(quality, key)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-xs font-bold transition-all"
                        style={{
                          background: `color-mix(in srgb, var(${colorVar}) 12%, transparent)`,
                          color: `var(${colorVar})`,
                          border: `1px solid color-mix(in srgb, var(${colorVar}) 30%, transparent)`,
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

      {/* Next upcoming tour reviews */}
      {section === 'tour' && nextTourReviews && nextTourReviews.length > 0 && items.every(item => checkedIds.includes(item.id)) && (
        <div
          className="rounded-xl px-4 py-3 mt-1"
          style={{
            background: 'var(--p-card)',
            border: '1px solid var(--p-border)',
          }}
        >
          <p className="text-xs font-bold mb-1.5" style={{ color: 'var(--p-text-75)' }}>
            Prochaine révision :
          </p>
          {nextTourReviews.slice(0, 3).map((nr, i) => {
            const name = SURAHS.find(s => s.number === nr.surah_number)?.name || `Sourate ${nr.surah_number}`;
            const date = new Date(nr.next_review_date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
            return (
              <p key={i} className="text-xs font-medium" style={{ color: 'var(--p-text-60)' }}>
                {name} v. {nr.verse_start} → {nr.verse_end} — <span style={{ color: 'var(--p-accent)' }}>{date}</span>
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}
