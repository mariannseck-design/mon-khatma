import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SURAHS } from '@/lib/surahData';
import { getExactVersePage } from '@/lib/quranData';
import { AppLayout } from '@/components/layout/AppLayout';
import { ArrowLeft, ChevronDown, ChevronUp, ChevronRight, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isTomorrow, isYesterday, isPast, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

function formatSmartDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return "Aujourd'hui";
  if (isTomorrow(d)) return 'Demain';
  if (isYesterday(d)) return 'Hier';
  return format(d, 'd MMM', { locale: fr });
}

const JUZ_PAGE_RANGES: { start: number; end: number }[] = [
  { start: 1, end: 21 }, { start: 22, end: 41 }, { start: 42, end: 61 },
  { start: 62, end: 81 }, { start: 82, end: 101 }, { start: 102, end: 121 },
  { start: 122, end: 141 }, { start: 142, end: 161 }, { start: 162, end: 181 },
  { start: 182, end: 201 }, { start: 202, end: 221 }, { start: 222, end: 241 },
  { start: 242, end: 261 }, { start: 262, end: 281 }, { start: 282, end: 301 },
  { start: 302, end: 321 }, { start: 322, end: 341 }, { start: 342, end: 361 },
  { start: 362, end: 381 }, { start: 382, end: 401 }, { start: 402, end: 421 },
  { start: 422, end: 441 }, { start: 442, end: 461 }, { start: 462, end: 481 },
  { start: 482, end: 501 }, { start: 502, end: 521 }, { start: 522, end: 541 },
  { start: 542, end: 561 }, { start: 562, end: 581 }, { start: 582, end: 604 },
];

interface MemorizedVerse {
  id: string;
  surah_number: number;
  verse_start: number;
  verse_end: number;
  sm2_ease_factor: number;
  next_review_date: string;
  last_reviewed_at: string | null;
  memorized_at: string;
  liaison_status: string;
}

interface JuzData {
  juzNumber: number;
  totalVerses: number;
  memorizedVerses: number;
  percentage: number;
  surahs: { number: number; name: string; verseRange: string }[];
  avgEase: number;
  nextReview: string | null;
  lastReviewed: string | null;
  retentionLabel: string;
  isOverdue: boolean;
}

function getRetentionLabel(avgEase: number): string {
  if (avgEase >= 2.8) return '🟢 Solide';
  if (avgEase >= 2.3) return '🟡 Moyen';
  if (avgEase >= 1.8) return '🟠 Fragile';
  return '🔴 À revoir';
}

function CircleProgress({ percentage, size = 72 }: { percentage: number; size?: number }) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke="var(--p-track)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke="var(--p-primary)" strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" className="transition-all duration-700" />
    </svg>
  );
}

export default function HifzSuiviTestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [memorized, setMemorized] = useState<MemorizedVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJuz, setExpandedJuz] = useState<number | null>(null);
  const [versePages, setVersePages] = useState<Map<string, number>>(new Map());
  const [showAllJuz, setShowAllJuz] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('hifz_memorized_verses')
        .select('*')
        .eq('user_id', user.id);
      setMemorized((data as MemorizedVerse[]) || []);
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (memorized.length === 0) return;
    (async () => {
      const pages = new Map<string, number>();
      for (const m of memorized) {
        const startPage = await getExactVersePage(m.surah_number, m.verse_start);
        const endPage = await getExactVersePage(m.surah_number, m.verse_end);
        pages.set(`${m.id}_start`, startPage);
        pages.set(`${m.id}_end`, endPage);
      }
      setVersePages(pages);
    })();
  }, [memorized]);

  const juzData = useMemo<JuzData[]>(() => {
    if (versePages.size === 0 && memorized.length > 0) return [];

    return Array.from({ length: 30 }, (_, i) => {
      const juzNum = i + 1;
      const range = JUZ_PAGE_RANGES[i];

      const juzSurahs = SURAHS.filter(s => {
        const nextSurah = SURAHS.find(ns => ns.number === s.number + 1);
        const surahEndPage = nextSurah ? nextSurah.startPage - 1 : 604;
        return s.startPage <= range.end && surahEndPage >= range.start;
      });

      // Use real verse count from surah metadata
      let totalVerses = 0;
      for (const s of juzSurahs) {
        totalVerses += s.versesCount;
      }

      const juzMemorized = memorized.filter(m => {
        const startPage = versePages.get(`${m.id}_start`) || 0;
        const endPage = versePages.get(`${m.id}_end`) || 0;
        return startPage <= range.end && endPage >= range.start;
      });

      let memorizedVerseCount = 0;
      const surahDetails = new Map<number, { minVerse: number; maxVerse: number }>();
      let easeSum = 0;
      let easeCount = 0;
      let earliestReview: string | null = null;
      let latestReviewed: string | null = null;

      for (const m of juzMemorized) {
        const count = m.verse_end - m.verse_start + 1;
        memorizedVerseCount += count;
        easeSum += m.sm2_ease_factor;
        easeCount++;

        const existing = surahDetails.get(m.surah_number);
        if (existing) {
          existing.minVerse = Math.min(existing.minVerse, m.verse_start);
          existing.maxVerse = Math.max(existing.maxVerse, m.verse_end);
        } else {
          surahDetails.set(m.surah_number, { minVerse: m.verse_start, maxVerse: m.verse_end });
        }

        const alreadyReviewedToday = m.last_reviewed_at && isToday(new Date(m.last_reviewed_at));
        if (!alreadyReviewedToday && (!earliestReview || m.next_review_date < earliestReview)) {
          earliestReview = m.next_review_date;
        }
        if (m.last_reviewed_at && (!latestReviewed || m.last_reviewed_at > latestReviewed)) {
          latestReviewed = m.last_reviewed_at;
        }
      }

      const avgEase = easeCount > 0 ? easeSum / easeCount : 0;
      const percentage = totalVerses > 0 ? Math.min(100, Math.round((memorizedVerseCount / totalVerses) * 100)) : 0;

      const surahs = Array.from(surahDetails.entries()).map(([num, r]) => {
        const s = SURAHS.find(s => s.number === num);
        return {
          number: num,
          name: s?.name || `Surah ${num}`,
          verseRange: `v.${r.minVerse}-${r.maxVerse}`,
        };
      });

      return {
        juzNumber: juzNum,
        totalVerses,
        memorizedVerses: memorizedVerseCount,
        percentage,
        surahs,
        avgEase,
        nextReview: earliestReview,
        lastReviewed: latestReviewed,
        retentionLabel: getRetentionLabel(avgEase),
      };
    });
  }, [memorized, versePages]);

  const hasData = (juz: JuzData) => juz.memorizedVerses > 0;
  const activeJuz = juzData.filter(hasData);
  const visibleJuz = showAllJuz ? juzData : activeJuz;

  if (loading) {
    return (
      <AppLayout title="Mon Suivi Hifz v2">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--p-primary)', borderTopColor: 'transparent' }} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Mon Suivi Hifz v2" hideNav bgClassName="bg-[var(--p-bg)]">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4 pb-6">
        <button onClick={() => navigate(-1)} className="transition-colors" style={{ color: 'var(--p-primary)' }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold tracking-wide" style={{ color: 'var(--p-text)' }}>
          📖 Vue par Juz
        </h1>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Juz commencés', value: activeJuz.length },
          { label: 'Ayats mémorisées', value: memorized.reduce((s, m) => s + (m.verse_end - m.verse_start + 1), 0) },
          { label: 'Progression', value: `${activeJuz.length > 0 ? Math.round(activeJuz.reduce((s, j) => s + j.percentage, 0) / activeJuz.length) : 0}%` },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl p-3 text-center" style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)', boxShadow: 'var(--p-card-shadow)' }}>
            <div className="text-lg font-bold" style={{ color: 'var(--p-primary)' }}>{stat.value}</div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--p-text-55)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => navigate('/hifz')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105 active:scale-95"
          style={{ background: 'var(--p-primary)', color: 'var(--p-on-dark)' }}
        >
          Apprendre du nouveau <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => navigate('/muraja')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105 active:scale-95"
          style={{ background: 'var(--p-card)', color: 'var(--p-primary)', border: '1.5px solid var(--p-primary)' }}
        >
          Réviser <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Toggle + Juz Grid */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--p-text-55)' }}>
          Détail par Juz
        </span>
        <button
          onClick={() => setShowAllJuz(!showAllJuz)}
          className="inline-flex items-center gap-1 text-[11px] font-medium transition-colors"
          style={{ color: 'var(--p-primary)' }}
        >
          {showAllJuz ? <><EyeOff className="w-3.5 h-3.5" /> Masquer les vides</> : <><Eye className="w-3.5 h-3.5" /> Voir tous les Juz</>}
        </button>
      </div>

      {visibleJuz.length === 0 && (
        <div className="rounded-xl p-6 text-center" style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)' }}>
          <p className="text-sm" style={{ color: 'var(--p-text-60)' }}>Aucun Juz commencé. Lance ta première mémorisation !</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-24">
        {visibleJuz.map(juz => {
          const active = hasData(juz);
          const expanded = expandedJuz === juz.juzNumber;

          if (!active) {
            return (
              <div key={juz.juzNumber}
                className="rounded-xl p-3 flex flex-col items-center gap-1 opacity-50"
                style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)' }}>
                <div className="text-[10px] font-medium" style={{ color: 'var(--p-text-55)' }}>Juz {juz.juzNumber}</div>
                <div className="relative">
                  <CircleProgress percentage={0} size={48} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-medium" style={{ color: 'var(--p-text-55)' }}>0%</span>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={juz.juzNumber}
              className={`rounded-xl transition-all duration-300 cursor-pointer ${
                expanded ? 'col-span-2 sm:col-span-3 shadow-lg' : 'hover:shadow-md'
              }`}
              style={{
                background: expanded ? 'var(--p-card-active)' : 'var(--p-card)',
                border: expanded ? '1.5px solid var(--p-primary)' : '1px solid var(--p-border)',
                boxShadow: expanded ? '0 8px 30px rgba(6,95,70,0.12)' : 'var(--p-card-shadow)',
              }}
              onClick={() => setExpandedJuz(expanded ? null : juz.juzNumber)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold" style={{ color: 'var(--p-primary)' }}>Juz {juz.juzNumber}</span>
                  {expanded
                    ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--p-primary)' }} />
                    : <ChevronDown className="w-4 h-4" style={{ color: 'var(--p-text-55)' }} />}
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <CircleProgress percentage={juz.percentage} size={expanded ? 80 : 64} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`font-bold ${expanded ? 'text-base' : 'text-sm'}`} style={{ color: 'var(--p-primary)' }}>
                        {juz.percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs mb-1" style={{ color: 'var(--p-text-65)' }}>
                      {juz.memorizedVerses} ayats mémorisées
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--p-track)' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${juz.percentage}%`, background: 'var(--p-primary)' }} />
                    </div>
                    <div className="text-[10px] mt-1" style={{ color: 'var(--p-text-55)' }}>{juz.retentionLabel}</div>
                  </div>
                </div>

                {expanded && (
                  <div className="mt-4 pt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300" style={{ borderTop: '1px solid var(--p-border)' }}>
                    {juz.surahs.length > 0 && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--p-text-55)' }}>Sourates</div>
                        <div className="flex flex-wrap gap-1.5">
                          {juz.surahs.map((s, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]"
                              style={{ background: 'var(--p-track)', color: 'var(--p-primary)' }}>
                              {s.name} <span style={{ color: 'var(--p-text-55)' }}>{s.verseRange}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {juz.lastReviewed && (
                        <div className="rounded-lg p-2" style={{ background: 'var(--p-track)' }}>
                          <div className="text-[9px] uppercase" style={{ color: 'var(--p-text-55)' }}>Dernière révision</div>
                          <div className="text-xs font-medium" style={{ color: 'var(--p-primary)' }}>
                            {formatSmartDate(juz.lastReviewed)}
                          </div>
                        </div>
                      )}
                      {juz.nextReview && (
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate('/muraja'); }}
                          className="rounded-lg p-2 text-left transition-colors hover:opacity-80 active:scale-95"
                          style={{ background: 'var(--p-track)' }}
                        >
                          <div className="text-[9px] uppercase" style={{ color: 'var(--p-text-55)' }}>Prochaine révision</div>
                          <div className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--p-primary)' }}>
                            {formatSmartDate(juz.nextReview)} <ChevronRight className="w-3 h-3" />
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
