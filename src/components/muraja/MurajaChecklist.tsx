import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, ThumbsUp, Crown, BookOpen, FileText, Info, CalendarDays, PartyPopper } from 'lucide-react';
import { SURAHS } from '@/lib/surahData';
import { getExactVersePage } from '@/lib/quranData';
import { useNavigate } from 'react-router-dom';

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
  checkedTourItems?: ChecklistItem[];
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
  checkedTourItems,
}: MurajaChecklistProps) {
  const navigate = useNavigate();
  const [ratingFor, setRatingFor] = useState<string | null>(null);
  const [pageMap, setPageMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    (async () => {
      const result: Record<string, number> = {};
      for (const item of items) {
        try {
          const page = await getExactVersePage(item.surah_number, item.verse_start);
          result[item.id] = page;
        } catch { /* skip */ }
      }
      if (!cancelled) setPageMap(result);
    })();
    return () => { cancelled = true; };
  }, [items]);

  const getSurahName = (num: number) =>
    SURAHS.find(s => s.number === num)?.name || `Sourate ${num}`;

  const openInReader = (itemId: string) => {
    const page = pageMap[itemId];
    if (page) navigate(`/quran-reader?page=${page}`);
  };

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

  // Sort items by Mushaf page number (ascending) when pageMap is available
  const sortedItems = [...items].sort((a, b) => {
    const pageA = pageMap[a.id] ?? Infinity;
    const pageB = pageMap[b.id] ?? Infinity;
    return pageA - pageB;
  });

  const getItemColor = (item: ChecklistItem) => {
    if (section !== 'rabt') return '#10B981';
    const daysPassed = getLiaisonDaysPassed(item.liaison_start_date);
    return daysPassed <= 7 ? '#14B8A6' : '#D4AF37';
  };

  if (sortedItems.length === 0) {
    if (section === 'tour' && hasTourBlocks) {
      const reviewedItems = checkedTourItems || [];
      return (
        <div className="space-y-2">
          {reviewedItems.length > 0 && (
            <div
              className="rounded-xl px-3 py-2.5"
              style={{
                background: 'var(--p-card-active)',
                border: '1px solid var(--p-border)',
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Check className="h-3.5 w-3.5" style={{ color: '#14B8A6' }} />
                <span className="text-[11px] font-bold" style={{ color: '#14B8A6' }}>
                  {reviewedItems.length} portion{reviewedItems.length > 1 ? 's' : ''} validée{reviewedItems.length > 1 ? 's' : ''} ✓
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {reviewedItems.map(item => {
                  const page = pageMap[item.id];
                  return (
                    <button
                      key={item.id}
                      onClick={() => page && openInReader(item.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors"
                      style={{
                        background: 'rgba(20, 184, 166, 0.10)',
                        border: '1px solid rgba(20, 184, 166, 0.25)',
                        color: '#14B8A6',
                      }}
                    >
                      <FileText className="h-2.5 w-2.5" />
                      {getSurahName(item.surah_number)} {page ? `p.${page}` : `v.${item.verse_start}-${item.verse_end}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {nextTourReviews && nextTourReviews.length > 0 && (
            <div
              className="rounded-xl px-3 py-2.5 space-y-1.5"
              style={{
                background: 'var(--p-card)',
                border: '1px solid var(--p-border)',
              }}
            >
              <p className="text-[10px] font-bold" style={{ color: 'var(--p-text-75)' }}>
                Prochaine révision :
              </p>
              {nextTourReviews.slice(0, 3).map((nr, i) => {
                const name = SURAHS.find(s => s.number === nr.surah_number)?.name || `Sourate ${nr.surah_number}`;
                const date = new Date(nr.next_review_date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs"
                    style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #065F46, #10B981)',
                        boxShadow: '0 2px 8px -2px rgba(16, 185, 129, 0.4)',
                      }}
                    >
                      <BookOpen className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold truncate text-[11px]" style={{ color: 'var(--p-primary)' }}>{name}</span>
                      <div className="flex items-center gap-1 text-[10px] font-medium" style={{ color: 'var(--p-text-60)' }}>
                        <span>v. {nr.verse_start} → {nr.verse_end}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0" style={{ color: '#10B981' }}>
                      <CalendarDays className="h-3 w-3" />
                      <span className="font-bold text-[10px]">{date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className="rounded-xl p-4 text-center"
        style={{
          background: 'var(--p-card)',
          border: '1px solid var(--p-border)',
        }}
      >
        <BookOpen className="h-5 w-5 mx-auto mb-1.5" style={{ color: 'var(--p-accent)' }} />
        <p className="text-xs font-medium" style={{ color: 'var(--p-text-65)' }}>
          {section === 'rabt'
            ? 'Aucun acquis récent (< 30 jours)'
            : "Aucune révision planifiée aujourd'hui"}
        </p>
        {section === 'tour' && (
          <>
            <p className="text-[10px] mt-1" style={{ color: 'var(--p-text-50)' }}>
              Tes portions arriveront ici après 30 jours de liaison.
            </p>
            {firstArrivalDate && (() => {
              const arrival = new Date(firstArrivalDate + 'T00:00:00');
              arrival.setDate(arrival.getDate() + 30);
              const formatted = arrival.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
              const daysLeft = Math.max(0, Math.ceil((arrival.getTime() - Date.now()) / 86400000));
              return (
                <div className="flex items-center gap-1 mt-1.5 justify-center">
                  <CalendarDays className="h-3 w-3" style={{ color: 'var(--p-accent)' }} />
                  <p className="text-[10px] font-semibold" style={{ color: 'var(--p-accent)' }}>
                    Première portion le {formatted} ({daysLeft > 0 ? `dans ${daysLeft}j` : "aujourd'hui"})
                  </p>
                </div>
              );
            })()}
          </>
        )}
      </div>
    );
  }

  // Split checked vs unchecked for rabt compact mode
  const checkedItems = sortedItems.filter(i => checkedIds.includes(i.id));
  const uncheckedItems = sortedItems.filter(i => !checkedIds.includes(i.id));

  return (
    <div className="space-y-2">
      {/* Cap message */}
      {isCapActive && totalDue && (
        <div
          className="flex items-start gap-2 rounded-xl px-3 py-2 text-[11px]"
          style={{
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.25)',
            color: 'var(--p-accent)',
          }}
        >
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>Plafonnée à 10 portions ({totalDue} dues au total).</span>
        </div>
      )}

      {/* Compact checked rabt items */}
      {checkedItems.length > 0 && (() => {
        const isRabt = section === 'rabt';
        const accentColor = isRabt ? '#D4AF37' : '#10B981';
        const badgeBg = isRabt ? 'rgba(212,175,55,0.10)' : 'rgba(16,185,129,0.10)';
        const badgeBorder = isRabt ? 'rgba(212,175,55,0.25)' : 'rgba(16,185,129,0.25)';
        return (
          <div
            className="rounded-xl px-3 py-2.5"
            style={{
              background: 'var(--p-card-active)',
              border: '1px solid var(--p-border)',
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Check className="h-3.5 w-3.5" style={{ color: accentColor }} />
              <span className="text-[11px] font-bold" style={{ color: accentColor }}>
                {checkedItems.length} portion{checkedItems.length > 1 ? 's' : ''} validée{checkedItems.length > 1 ? 's' : ''} ✓
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {checkedItems.map(item => {
                const page = pageMap[item.id];
                return (
                  <button
                    key={item.id}
                    onClick={() => page && openInReader(item.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors"
                    style={{
                      background: badgeBg,
                      border: `1px solid ${badgeBorder}`,
                      color: accentColor,
                    }}
                  >
                    <FileText className="h-2.5 w-2.5" />
                    {getSurahName(item.surah_number)} {page ? `p.${page}` : `v.${item.verse_start}-${item.verse_end}`}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {uncheckedItems.map((item) => {
        const isChecked = checkedIds.includes(item.id);
        const isRating = ratingFor === item.id;
        const daysPassed = section === 'rabt' ? getLiaisonDaysPassed(item.liaison_start_date) : 0;
        const itemColor = getItemColor(item);

        return (
          <div key={item.id}>
            <div
              className="w-full rounded-xl px-3.5 py-3 transition-all"
              style={{
                background: isChecked ? 'var(--p-card-active)' : 'var(--p-card)',
                border: '1px solid var(--p-border)',
                borderLeft: `3px solid ${itemColor}`,
                opacity: isChecked ? 0.8 : 1,
              }}
            >
              <div className="flex items-center gap-2.5">
                {/* Checkbox */}
                <motion.div
                  className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isChecked ? itemColor : 'transparent',
                    border: `2px solid ${isChecked ? itemColor : 'var(--p-checkbox-border)'}`,
                  }}
                  animate={isChecked ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  {isChecked && <Check className="h-3 w-3" style={{ color: '#FFFFFF' }} />}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p
                      className="text-sm truncate"
                      style={{
                        color: isChecked ? 'var(--p-primary)' : 'var(--p-text)',
                        fontWeight: isChecked ? 800 : 700,
                      }}
                    >
                      {getSurahName(item.surah_number)}
                    </p>
                    {pageMap[item.id] && (
                      <button
                        onClick={(e) => { e.stopPropagation(); openInReader(item.id); }}
                        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold transition-colors"
                        style={{
                          background: `color-mix(in srgb, ${itemColor} 10%, transparent)`,
                          color: itemColor,
                          border: `1px solid color-mix(in srgb, ${itemColor} 20%, transparent)`,
                        }}
                        title="Ouvrir dans le lecteur"
                      >
                        <FileText className="h-2.5 w-2.5" />
                        {pageMap[item.id]}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--p-text-60)' }}>
                    <BookOpen className="h-2.5 w-2.5 flex-shrink-0" style={{ color: itemColor }} />
                    <span>{item.verse_start} → {item.verse_end}</span>
                    {section === 'tour' && (
                      isChecked
                        ? <span className="ml-1 font-bold" style={{ color: '#10B981' }}>· Révision faite ✓</span>
                        : item.sm2_interval != null
                          ? <span className="ml-1 opacity-80">· {humanizeInterval(item.sm2_interval)}</span>
                          : null
                    )}
                    {section === 'rabt' && (
                      <span className="ml-1 opacity-80">· Jour {daysPassed}/30</span>
                    )}
                  </div>

                  {/* Mini progress bar for rabt */}
                  {section === 'rabt' && item.liaison_start_date && (
                    <div className="w-full h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: 'var(--p-track)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #B8960C, #D4AF37)' }}
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
                  className="w-full mt-2.5 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-all"
                  style={{
                    background: section === 'rabt'
                      ? (daysPassed <= 7
                        ? 'linear-gradient(135deg, #0D9488, #14B8A6)'
                        : 'linear-gradient(135deg, #B8960C, #D4AF37)')
                      : 'linear-gradient(135deg, #065F46, #10B981)',
                    color: '#FFFFFF',
                    boxShadow: `0 2px 8px -2px color-mix(in srgb, ${itemColor} 40%, transparent)`,
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
                  <div className="flex gap-2 px-1 py-2">
                    {RATINGS.map(({ key, label, quality, icon: Icon, colorVar }) => (
                      <button
                        key={key}
                        onClick={() => handleRate(quality, key)}
                        className="flex-1 flex items-center justify-center gap-1 rounded-lg px-2 py-2.5 text-[11px] font-bold transition-all"
                        style={{
                          background: `color-mix(in srgb, var(${colorVar}) 12%, transparent)`,
                          color: `var(${colorVar})`,
                          border: `1px solid color-mix(in srgb, var(${colorVar}) 30%, transparent)`,
                        }}
                      >
                        <Icon className="h-3 w-3" />
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
          className="rounded-xl px-3 py-2.5 mt-1 space-y-1.5"
          style={{
            background: 'var(--p-card)',
            border: '1px solid var(--p-border)',
          }}
        >
          <p className="text-[10px] font-bold" style={{ color: 'var(--p-text-75)' }}>
            Prochaine révision :
          </p>
          {nextTourReviews.slice(0, 3).map((nr, i) => {
            const name = SURAHS.find(s => s.number === nr.surah_number)?.name || `Sourate ${nr.surah_number}`;
            const date = new Date(nr.next_review_date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
            return (
              <div
                key={i}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs"
                style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #065F46, #10B981)',
                    boxShadow: '0 2px 8px -2px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <BookOpen className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold truncate text-[11px]" style={{ color: 'var(--p-primary)' }}>{name}</span>
                  <div className="flex items-center gap-1 text-[10px] font-medium" style={{ color: 'var(--p-text-60)' }}>
                    <span>v. {nr.verse_start} → {nr.verse_end}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0" style={{ color: '#10B981' }}>
                  <CalendarDays className="h-3 w-3" />
                  <span className="font-bold text-[10px]">{date}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
