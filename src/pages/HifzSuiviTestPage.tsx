import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SURAHS } from '@/lib/surahData';
import { getExactVersePage } from '@/lib/quranData';
import { AppLayout } from '@/components/layout/AppLayout';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Juz boundaries (standard Mushaf: 604 pages, ~20 pages per juz)
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
        stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke="hsl(var(--primary))" strokeWidth={strokeWidth}
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

  // Fetch memorized verses
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

  // Resolve pages for all verse blocks
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

  // Build Juz data
  const juzData = useMemo<JuzData[]>(() => {
    if (versePages.size === 0 && memorized.length > 0) return [];

    return Array.from({ length: 30 }, (_, i) => {
      const juzNum = i + 1;
      const range = JUZ_PAGE_RANGES[i];

      // Find surahs in this juz
      const juzSurahs = SURAHS.filter(s => {
        const nextSurah = SURAHS.find(ns => ns.number === s.number + 1);
        const surahEndPage = nextSurah ? nextSurah.startPage - 1 : 604;
        return s.startPage <= range.end && surahEndPage >= range.start;
      });

      // Total verses in this juz (approximate from surahs)
      let totalVerses = 0;
      for (const s of juzSurahs) {
        totalVerses += s.versesCount;
      }
      // Rough: ~15 verses per page × pages in juz
      const pagesInJuz = range.end - range.start + 1;
      const approxTotalVerses = pagesInJuz * 15;

      // Find memorized blocks in this juz
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

        if (!earliestReview || m.next_review_date < earliestReview) {
          earliestReview = m.next_review_date;
        }
        if (m.last_reviewed_at && (!latestReviewed || m.last_reviewed_at > latestReviewed)) {
          latestReviewed = m.last_reviewed_at;
        }
      }

      const avgEase = easeCount > 0 ? easeSum / easeCount : 0;
      const percentage = approxTotalVerses > 0 ? Math.min(100, Math.round((memorizedVerseCount / approxTotalVerses) * 100)) : 0;

      const surahs = Array.from(surahDetails.entries()).map(([num, range]) => {
        const s = SURAHS.find(s => s.number === num);
        return {
          number: num,
          name: s?.name || `Surah ${num}`,
          verseRange: `v.${range.minVerse}-${range.maxVerse}`,
        };
      });

      return {
        juzNumber: juzNum,
        totalVerses: approxTotalVerses,
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

  if (loading) {
    return (
      <AppLayout title="Mon Suivi Hifz v2">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Mon Suivi Hifz v2" hideNav bgClassName="bg-gradient-to-b from-[hsl(175,40%,12%)] to-[hsl(175,35%,18%)]">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4 pb-6">
        <button onClick={() => navigate(-1)} className="text-teal-200 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-teal-50 tracking-wide">
          📖 Vue par Juz
        </h1>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Juz commencés', value: juzData.filter(j => hasData(j)).length },
          { label: 'Ayats mémorisées', value: memorized.reduce((s, m) => s + (m.verse_end - m.verse_start + 1), 0) },
          { label: 'Progression', value: `${Math.round(juzData.reduce((s, j) => s + j.percentage, 0) / 30)}%` },
        ].map((stat, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
            <div className="text-lg font-bold text-teal-100">{stat.value}</div>
            <div className="text-[10px] text-teal-300/80 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Juz Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-24">
        {juzData.map(juz => {
          const active = hasData(juz);
          const expanded = expandedJuz === juz.juzNumber;

          if (!active) {
            // Compact card
            return (
              <div key={juz.juzNumber}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5 flex flex-col items-center gap-1 opacity-60 hover:opacity-80 transition-opacity">
                <div className="text-[10px] text-teal-400/60 font-medium">Juz {juz.juzNumber}</div>
                <div className="relative">
                  <CircleProgress percentage={0} size={48} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] text-teal-300/50 font-medium">0%</span>
                  </div>
                </div>
              </div>
            );
          }

          // Active card
          return (
            <div key={juz.juzNumber}
              className={`rounded-xl border transition-all duration-300 cursor-pointer ${
                expanded
                  ? 'col-span-2 sm:col-span-3 bg-white/15 backdrop-blur-md border-teal-400/30 shadow-lg shadow-teal-900/20'
                  : 'bg-white/10 backdrop-blur-sm border-teal-400/20 hover:bg-white/15'
              }`}
              onClick={() => setExpandedJuz(expanded ? null : juz.juzNumber)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-teal-200">Juz {juz.juzNumber}</span>
                  {expanded ? <ChevronUp className="w-4 h-4 text-teal-300" /> : <ChevronDown className="w-4 h-4 text-teal-300/50" />}
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <CircleProgress percentage={juz.percentage} size={expanded ? 80 : 64} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`font-bold text-teal-100 ${expanded ? 'text-base' : 'text-sm'}`}>
                        {juz.percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-teal-200/80 mb-1">
                      {juz.memorizedVerses} ayats mémorisées
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${juz.percentage}%` }} />
                    </div>
                    <div className="text-[10px] text-teal-300/60 mt-1">{juz.retentionLabel}</div>
                  </div>
                </div>

                {/* Expanded details */}
                {expanded && (
                  <div className="mt-4 pt-3 border-t border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Surahs */}
                    {juz.surahs.length > 0 && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-teal-400/60 mb-1.5">Sourates</div>
                        <div className="flex flex-wrap gap-1.5">
                          {juz.surahs.map((s, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/20 text-[11px] text-teal-200">
                              {s.name} <span className="text-teal-400/60">{s.verseRange}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Review info */}
                    <div className="grid grid-cols-2 gap-2">
                      {juz.nextReview && (
                        <div className="bg-white/5 rounded-lg p-2">
                          <div className="text-[9px] text-teal-400/50 uppercase">Prochaine révision</div>
                          <div className="text-xs text-teal-100 font-medium">
                            {format(new Date(juz.nextReview), 'd MMM', { locale: fr })}
                          </div>
                        </div>
                      )}
                      {juz.lastReviewed && (
                        <div className="bg-white/5 rounded-lg p-2">
                          <div className="text-[9px] text-teal-400/50 uppercase">Dernière révision</div>
                          <div className="text-xs text-teal-100 font-medium">
                            {format(new Date(juz.lastReviewed), 'd MMM', { locale: fr })}
                          </div>
                        </div>
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
