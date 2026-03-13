import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle2, Sparkles, ArrowLeft, Layers, Plus, X, ChevronDown, ChevronUp, Building2, Sprout, Clock, RotateCcw } from 'lucide-react';
import { SURAHS } from '@/lib/surahData';
import { surahsToVerseBlocks, pageRangeToVerseBlocks, injectMemorizedVerses } from '@/lib/hifzUtils';
import { getExactVersePage } from '@/lib/quranData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface HifzDiagnosticProps {
  onComplete: () => void;
  onSkip: () => void;
}

type TabId = 'pages' | 'juz' | 'surahs';
type DiagnosticStep = 'choose-category' | 'solid-entry' | 'recent-entry' | 'recent-days' | 'confirming' | 'done';
type Category = 'solid' | 'recent';

interface PageInterval {
  id: string;
  start: number;
  end: number;
}

interface SurahSelection {
  selected: boolean;
  verseStart?: number;
  verseEnd?: number;
}

interface BlockWithMeta {
  surahNumber: number;
  verseStart: number;
  verseEnd: number;
  category: Category;
  daysAlreadyDone?: number;
}

// Juz data
const JUZ_DATA = Array.from({ length: 30 }, (_, i) => ({
  number: i + 1,
  label: `Juz ${i + 1}`,
  startPage: 1,
  endPage: 604,
}));

const JUZ_START_PAGES = [
  1, 22, 42, 62, 82, 102, 121, 142, 162, 182,
  201, 222, 242, 262, 282, 302, 322, 342, 362, 382,
  402, 422, 442, 462, 482, 502, 522, 542, 562, 582
];
JUZ_DATA.forEach((juz, i) => {
  juz.startPage = JUZ_START_PAGES[i];
  juz.endPage = (i < 29 ? JUZ_START_PAGES[i + 1] - 1 : 604);
});

function RecentBlocksList({ blocks, recentDaysMap, setRecentDaysMap, glassBg: glsBg }: {
  blocks: BlockWithMeta[];
  recentDaysMap: Map<number, number>;
  setRecentDaysMap: React.Dispatch<React.SetStateAction<Map<number, number>>>;
  glassBg: string;
}) {
  const [pageLabels, setPageLabels] = useState<Record<number, string>>({});

  useEffect(() => {
    const resolve = async () => {
      const labels: Record<number, string> = {};
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        const pStart = await getExactVersePage(b.surahNumber, b.verseStart);
        const pEnd = await getExactVersePage(b.surahNumber, b.verseEnd);
        labels[i] = pStart === pEnd ? `p. ${pStart}` : `p. ${pStart}–${pEnd}`;
      }
      setPageLabels(labels);
    };
    if (blocks.length > 0) resolve();
  }, [blocks]);

  return (
    <div className="space-y-3 max-h-[50vh] overflow-y-auto">
      {blocks.map((b, i) => {
        const s = SURAHS.find(s => s.number === b.surahNumber);
        const days = recentDaysMap.get(i) || 1;
        const remaining = 30 - days;
        return (
          <div key={i} className="rounded-2xl p-4 space-y-3"
            style={{ background: glsBg, border: '1px solid rgba(74,222,128,0.2)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">
                {s?.name || `S.${b.surahNumber}`} — v.{b.verseStart}→{b.verseEnd}
                {pageLabels[i] && <span className="font-normal text-white/50 ml-1">({pageLabels[i]})</span>}
              </span>
            </div>
            <div>
              <p className="text-[10px] text-white/50 mb-2">
                Depuis combien de jours récitez-vous ce passage ?
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={1} max={29} value={days}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setRecentDaysMap(prev => {
                      const next = new Map(prev);
                      next.set(i, val);
                      return next;
                    });
                  }}
                  className="flex-1 accent-[#4ade80]"
                />
                <span className="text-sm font-bold w-8 text-center" style={{ color: '#4ade80' }}>{days}j</span>
              </div>
            </div>
            <div className="rounded-lg px-3 py-1.5 text-center" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
              <p className="text-[11px] font-medium" style={{ color: '#4ade80' }}>
                ➜ {remaining} jour{remaining > 1 ? 's' : ''} de Liaison restant{remaining > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'pages', label: 'Par Pages', icon: '📄' },
  { id: 'juz', label: 'Par Juz', icon: '📚' },
  { id: 'surahs', label: 'Par Sourates', icon: '📖' },
];

const goldColor = '#d4af37';
const goldBg = 'rgba(212,175,55,0.15)';
const goldBorder = 'rgba(212,175,55,0.3)';
const goldBorderActive = 'rgba(212,175,55,0.6)';
const glassBg = 'rgba(255,255,255,0.08)';
const glassBorder = 'rgba(255,255,255,0.12)';

export default function HifzDiagnostic({ onComplete, onSkip }: HifzDiagnosticProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<DiagnosticStep>('choose-category');
  const [activeTab, setActiveTab] = useState<TabId>('pages');
  const [saving, setSaving] = useState(false);

  // Accumulated blocks from both categories
  const [solidBlocks, setSolidBlocks] = useState<BlockWithMeta[]>([]);
  const [recentBlocks, setRecentBlocks] = useState<BlockWithMeta[]>([]);
  const [recentDaysMap, setRecentDaysMap] = useState<Map<number, number>>(new Map()); // index -> days

  // Human-readable labels for what the user entered (e.g. "Pages 1-10, 50-55")
  const [solidLabels, setSolidLabels] = useState<string[]>([]);
  const [recentLabels, setRecentLabels] = useState<string[]>([]);

  // Pages state
  const [pageIntervals, setPageIntervals] = useState<PageInterval[]>([{ id: '1', start: 1, end: 20 }]);

  // Juz state
  const [selectedJuz, setSelectedJuz] = useState<Set<number>>(new Set());

  // Surahs state
  const [surahSelections, setSurahSelections] = useState<Map<number, SurahSelection>>(new Map());
  const [expandedSurah, setExpandedSurah] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Reset entry form ───
  const resetEntryForm = () => {
    setPageIntervals([{ id: '1', start: 1, end: 20 }]);
    setSelectedJuz(new Set());
    setSurahSelections(new Map());
    setExpandedSurah(null);
    setSearchQuery('');
    setActiveTab('pages');
  };

  // ─── Page intervals logic ───
  const addInterval = () => {
    const lastEnd = pageIntervals[pageIntervals.length - 1]?.end || 0;
    setPageIntervals(prev => [...prev, {
      id: Date.now().toString(),
      start: Math.min(lastEnd + 1, 604),
      end: Math.min(lastEnd + 20, 604),
    }]);
  };

  const removeInterval = (id: string) => {
    if (pageIntervals.length <= 1) return;
    setPageIntervals(prev => prev.filter(i => i.id !== id));
  };

  const updateInterval = (id: string, field: 'start' | 'end', value: number) => {
    setPageIntervals(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const toggleJuz = (num: number) => {
    setSelectedJuz(prev => {
      const next = new Set(prev);
      next.has(num) ? next.delete(num) : next.add(num);
      return next;
    });
  };

  const toggleSurah = (num: number) => {
    setSurahSelections(prev => {
      const next = new Map(prev);
      const existing = next.get(num);
      if (existing?.selected) {
        next.delete(num);
      } else {
        const surah = SURAHS.find(s => s.number === num);
        next.set(num, { selected: true, verseStart: 1, verseEnd: surah?.versesCount || 1 });
      }
      return next;
    });
  };

  const updateSurahVerses = (num: number, field: 'verseStart' | 'verseEnd', value: number) => {
    setSurahSelections(prev => {
      const next = new Map(prev);
      const existing = next.get(num);
      if (existing) next.set(num, { ...existing, [field]: value });
      return next;
    });
  };

  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return SURAHS;
    const q = searchQuery.toLowerCase();
    return SURAHS.filter(
      s => s.name.toLowerCase().includes(q) || s.nameFr.toLowerCase().includes(q) || String(s.number).includes(q)
    );
  }, [searchQuery]);

  // ─── Build blocks from current form ───
  const buildCurrentBlocks = useCallback(async (category: Category): Promise<BlockWithMeta[]> => {
    let rawBlocks: { surahNumber: number; verseStart: number; verseEnd: number }[] = [];
    if (activeTab === 'pages') {
      for (const interval of pageIntervals) {
        const blocks = await pageRangeToVerseBlocks(interval.start, interval.end);
        rawBlocks.push(...blocks);
      }
    } else if (activeTab === 'juz') {
      for (const juzNum of Array.from(selectedJuz).sort((a, b) => a - b)) {
        const juz = JUZ_DATA[juzNum - 1];
        if (juz) {
          const blocks = await pageRangeToVerseBlocks(juz.startPage, juz.endPage);
          rawBlocks.push(...blocks);
        }
      }
    } else {
      surahSelections.forEach((sel, num) => {
        if (sel.selected) {
          rawBlocks.push({
            surahNumber: num,
            verseStart: sel.verseStart || 1,
            verseEnd: sel.verseEnd || SURAHS.find(s => s.number === num)?.versesCount || 1,
          });
        }
      });
      rawBlocks.sort((a, b) => a.surahNumber - b.surahNumber);
    }
    return rawBlocks.map(b => ({ ...b, category }));
  }, [activeTab, pageIntervals, selectedJuz, surahSelections]);

  const hasSelection = useMemo(() => {
    if (activeTab === 'pages') return pageIntervals.some(i => i.end >= i.start);
    if (activeTab === 'juz') return selectedJuz.size > 0;
    return Array.from(surahSelections.values()).some(s => s.selected);
  }, [activeTab, pageIntervals, selectedJuz, surahSelections]);

  // ─── Build a human-readable label from current form ───
  const buildEntryLabel = (): string => {
    if (activeTab === 'pages') {
      return pageIntervals.map(i => `p.${i.start}-${i.end}`).join(', ');
    } else if (activeTab === 'juz') {
      const nums = Array.from(selectedJuz).sort((a, b) => a - b);
      return nums.map(n => `Juz ${n}`).join(', ');
    } else {
      const selected = Array.from(surahSelections.entries())
        .filter(([, sel]) => sel.selected)
        .sort(([a], [b]) => a - b);
      return selected.map(([num]) => {
        const s = SURAHS.find(s => s.number === num);
        return s ? s.name : `S.${num}`;
      }).join(', ');
    }
  };

  // ─── Compute total pages from labels ───
  const countPagesFromIntervals = (intervals: PageInterval[]) =>
    intervals.reduce((sum, i) => sum + Math.max(0, i.end - i.start + 1), 0);

  // ─── Save entry for a category ───
  const saveCurrentEntry = async (category: Category) => {
    const blocks = await buildCurrentBlocks(category);
    const label = buildEntryLabel();
    if (category === 'solid') {
      setSolidBlocks(prev => [...prev, ...blocks]);
      setSolidLabels(prev => [...prev, label]);
      resetEntryForm();
      setStep('choose-category');
    } else {
      setRecentBlocks(prev => [...prev, ...blocks]);
      setRecentLabels(prev => [...prev, label]);
      // Initialize days map for new blocks
      setRecentDaysMap(prev => {
        const next = new Map(prev);
        const startIdx = recentBlocks.length;
        blocks.forEach((_, i) => {
          if (!next.has(startIdx + i)) next.set(startIdx + i, 1);
        });
        return next;
      });
      resetEntryForm();
      setStep('recent-days');
    }
  };

  // ─── Confirm handler ───
  const handleConfirm = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Inject solid blocks
      if (solidBlocks.length > 0) {
        await injectMemorizedVerses(user.id, solidBlocks, { category: 'solid' });
      }
      // Inject recent blocks with their respective days
      if (recentBlocks.length > 0) {
        // Group by daysAlreadyDone for batch injection
        const byDays = new Map<number, BlockWithMeta[]>();
        recentBlocks.forEach((b, i) => {
          const days = recentDaysMap.get(i) || 1;
          if (!byDays.has(days)) byDays.set(days, []);
          byDays.get(days)!.push(b);
        });
        for (const [days, blocks] of byDays) {
          await injectMemorizedVerses(user.id, blocks, { category: 'recent', daysAlreadyDone: days });
        }
      }
      await supabase.from('profiles').update({ onboarding_completed: true }).eq('user_id', user.id);
      setStep('done');
      const totalCount = solidBlocks.length + recentBlocks.length;
      toast({ title: 'Acquis enregistrés ✨', description: `${totalCount} passages ajoutés à votre programme.` });
      setTimeout(() => onComplete(), 2000);
    } catch (err) {
      console.error('Diagnostic error:', err);
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder vos acquis.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (user) {
      await supabase.from('profiles').update({ onboarding_completed: true }).eq('user_id', user.id);
    }
    onSkip();
  };

  const pageAnim = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  };

  // ─── DONE SCREEN ───
  if (step === 'done') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <Sparkles className="h-12 w-12" style={{ color: goldColor }} />
        <h2 className="text-xl font-bold" style={{ color: goldColor, fontFamily: "'Playfair Display', serif" }}>
          Acquis enregistrés !
        </h2>
        <p className="text-sm text-white/70 max-w-xs">
          Votre programme de révision a été créé.
          {solidBlocks.length > 0 && ` ${solidBlocks.length} portion${solidBlocks.length > 1 ? 's' : ''} en révision espacée.`}
          {recentBlocks.length > 0 && ` ${recentBlocks.length} portion${recentBlocks.length > 1 ? 's' : ''} en liaison quotidienne.`}
        </p>
      </motion.div>
    );
  }

  // ─── CONFIRMATION SCREEN ───
  if (step === 'confirming') {
    return (
      <motion.div {...pageAnim} className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep('choose-category')} className="p-2 rounded-xl" style={{ background: glassBg }}>
            <ArrowLeft className="h-4 w-4 text-white/70" />
          </button>
          <h2 className="text-lg font-bold" style={{ color: goldColor, fontFamily: "'Playfair Display', serif" }}>
            Confirmation
          </h2>
        </div>

        <div className="text-center space-y-2">
          <Layers className="h-10 w-10 mx-auto" style={{ color: goldColor }} />
          <p className="text-white/80 text-sm leading-relaxed">
            Vos acquis seront répartis selon leur ancienneté.
          </p>
        </div>

        {/* Solid blocks */}
        {solidBlocks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" style={{ color: goldColor }} />
              <h3 className="text-sm font-bold" style={{ color: goldColor }}>Acquis Solides — Révision espacée</h3>
            </div>
            <div className="rounded-2xl p-3 max-h-[20vh] overflow-y-auto space-y-1"
              style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${goldBorder}` }}>
              {solidBlocks.map((b, i) => {
                const s = SURAHS.find(s => s.number === b.surahNumber);
                return (
                  <p key={i} className="text-sm text-white/70 flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" style={{ color: goldColor }} />
                    {s?.name || `S.${b.surahNumber}`} — v.{b.verseStart}→{b.verseEnd}
                  </p>
                );
              })}
            </div>
            <p className="text-[10px] text-white/50 italic">
              Révision espacée étalée sur 14 jours
            </p>
          </div>
        )}

        {/* Recent blocks */}
        {recentBlocks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sprout className="h-4 w-4" style={{ color: '#4ade80' }} />
              <h3 className="text-sm font-bold" style={{ color: '#4ade80' }}>Mémorisations Récentes — Liaison</h3>
            </div>
            <div className="rounded-2xl p-3 max-h-[20vh] overflow-y-auto space-y-1"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(74,222,128,0.3)' }}>
              {recentBlocks.map((b, i) => {
                const s = SURAHS.find(s => s.number === b.surahNumber);
                const days = recentDaysMap.get(i) || 1;
                const remaining = 30 - days;
                return (
                  <p key={i} className="text-sm text-white/70 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#4ade80' }} />
                      {s?.name || `S.${b.surahNumber}`} — v.{b.verseStart}→{b.verseEnd}
                    </span>
                    <span className="text-[10px] font-medium" style={{ color: '#4ade80' }}>
                      {remaining}j restants
                    </span>
                  </p>
                );
              })}
            </div>
            <p className="text-[10px] text-white/50 italic">
              Récitation quotidienne obligatoire jusqu'à 30 jours
            </p>
          </div>
        )}

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleConfirm} disabled={saving}
          className="w-full rounded-xl py-4 font-bold text-base"
          style={{ background: `linear-gradient(135deg, ${goldColor}, #c4a030)`, color: '#1a2e1a' }}>
          {saving ? 'Enregistrement...' : '✨ Confirmer et continuer'}
        </motion.button>
      </motion.div>
    );
  }

  // ─── RECENT DAYS SCREEN ───
  if (step === 'recent-days') {
    return (
      <motion.div {...pageAnim} className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep('choose-category')} className="p-2 rounded-xl" style={{ background: glassBg }}>
            <ArrowLeft className="h-4 w-4 text-white/70" />
          </button>
          <h2 className="text-lg font-bold" style={{ color: '#4ade80', fontFamily: "'Playfair Display', serif" }}>
            Durée de liaison
          </h2>
        </div>

        <p className="text-xs text-white/60 leading-relaxed">
          Pour chaque passage récent, indiquez depuis combien de jours vous le récitez quotidiennement. L'application calculera le reliquat de Liaison.
        </p>

        <RecentBlocksList blocks={recentBlocks} recentDaysMap={recentDaysMap} setRecentDaysMap={setRecentDaysMap} glassBg={glassBg} />

        <motion.button whileTap={{ scale: 0.97 }}
          onClick={() => setStep('choose-category')}
          className="w-full rounded-xl py-3 font-bold text-sm"
          style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }}>
          ✓ Valider les durées
        </motion.button>
      </motion.div>
    );
  }

  // ─── ENTRY SCREEN (shared for solid & recent) ───
  if (step === 'solid-entry' || step === 'recent-entry') {
    const category: Category = step === 'solid-entry' ? 'solid' : 'recent';
    const accentColor = category === 'solid' ? goldColor : '#4ade80';
    const accentBg = category === 'solid' ? goldBg : 'rgba(74,222,128,0.15)';
    const accentBorder = category === 'solid' ? goldBorder : 'rgba(74,222,128,0.3)';

    const totalPages = (() => {
      if (activeTab === 'pages') return pageIntervals.reduce((sum, i) => sum + Math.max(0, i.end - i.start + 1), 0);
      if (activeTab === 'juz') return Array.from(selectedJuz).reduce((sum, j) => {
        const juz = JUZ_DATA[j - 1];
        return sum + (juz ? juz.endPage - juz.startPage + 1 : 0);
      }, 0);
      let totalVerses = 0;
      surahSelections.forEach((sel) => {
        if (sel.selected) totalVerses += (sel.verseEnd || 0) - (sel.verseStart || 1) + 1;
      });
      return Math.ceil(totalVerses / 15);
    })();

    return (
      <motion.div {...pageAnim} className="flex flex-col min-h-[75vh]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => { resetEntryForm(); setStep('choose-category'); }} className="p-2 rounded-xl" style={{ background: glassBg }}>
            <ArrowLeft className="h-4 w-4 text-white/70" />
          </button>
          <div>
            <h2 className="text-base font-bold" style={{ color: accentColor, fontFamily: "'Playfair Display', serif" }}>
              {category === 'solid' ? '🏛️ Acquis Solides' : '🌱 Mémorisations Récentes'}
            </h2>
            <p className="text-[10px] text-white/50">
              {category === 'solid' ? 'Appris il y a plus d\'un mois' : 'Appris durant les 30 derniers jours'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-2xl p-1 mb-4" style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${glassBorder}` }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: isActive ? accentBg : 'transparent',
                  color: isActive ? accentColor : 'rgba(255,255,255,0.5)',
                  border: isActive ? `1px solid ${accentBorder}` : '1px solid transparent',
                }}
                whileTap={{ scale: 0.97 }}>
                <span className="mr-1">{tab.icon}</span> {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto pb-32">
          <AnimatePresence mode="wait">
            {activeTab === 'pages' && <PagesTab key="pages" intervals={pageIntervals} onAdd={addInterval} onRemove={removeInterval} onUpdate={updateInterval} />}
            {activeTab === 'juz' && <JuzTab key="juz" selected={selectedJuz} onToggle={toggleJuz} />}
            {activeTab === 'surahs' && (
              <SurahsTab key="surahs" surahs={filteredSurahs} selections={surahSelections}
                expandedSurah={expandedSurah} searchQuery={searchQuery} onSearch={setSearchQuery}
                onToggle={toggleSurah} onExpand={setExpandedSurah} onUpdateVerses={updateSurahVerses} />
            )}
          </AnimatePresence>
        </div>

        {/* Sticky footer */}
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-3"
          style={{ background: 'linear-gradient(to top, rgba(13,115,119,0.98) 70%, transparent)' }}>
          <div className="max-w-lg mx-auto space-y-2">
            {hasSelection && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl px-4 py-2 text-center"
                style={{ background: accentBg, border: `1px solid ${accentBorder}` }}>
                <p className="text-xs font-medium" style={{ color: accentColor }}>
                  ≈ <strong>{totalPages} pages</strong> sélectionnées
                </p>
              </motion.div>
            )}

            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => hasSelection ? saveCurrentEntry(category) : undefined}
              disabled={!hasSelection}
              className="w-full rounded-xl py-4 font-bold text-sm transition-all"
              style={{
                background: hasSelection ? `linear-gradient(135deg, ${accentColor}, ${category === 'solid' ? '#c4a030' : '#22c55e'})` : 'rgba(255,255,255,0.1)',
                color: hasSelection ? '#1a2e1a' : 'rgba(255,255,255,0.3)',
                boxShadow: hasSelection ? `0 4px 20px ${category === 'solid' ? 'rgba(212,175,55,0.3)' : 'rgba(74,222,128,0.3)'}` : 'none',
              }}>
              Ajouter ces acquis
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── CATEGORY CHOICE SCREEN ───
  return (
    <motion.div {...pageAnim} className="flex flex-col min-h-[75vh]">
      {/* Header */}
      <div className="text-center space-y-3 mb-6">
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: goldBg, border: `1px solid ${goldBorder}` }}>
            <BookOpen className="h-7 w-7" style={{ color: goldColor }} />
          </motion.div>
        </div>
        <h2 className="text-lg font-bold leading-snug"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: goldColor }}>
          Faisons le point sur votre parcours
        </h2>
        <p className="text-xs text-white/60 leading-relaxed max-w-[300px] mx-auto">
          Classez vos acquis selon leur ancienneté pour un programme de révision adapté.
        </p>
      </div>

      {/* Accumulated summary */}
      {(solidBlocks.length > 0 || recentBlocks.length > 0) && (
        <div className="rounded-2xl p-4 mb-4 space-y-2" style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${goldBorder}` }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold" style={{ color: goldColor }}>
              Acquis enregistrés
            </p>
            <button
              onClick={() => {
                if (window.confirm('Effacer tous les acquis enregistrés ?')) {
                  setSolidBlocks([]);
                  setRecentBlocks([]);
                  setSolidLabels([]);
                  setRecentLabels([]);
                  setRecentDaysMap(new Map());
                  resetEntryForm();
                  toast({ title: 'Acquis effacés', description: 'Vous pouvez recommencer votre saisie.' });
                }
              }}
              className="flex items-center gap-1 text-[10px] text-red-400/70 hover:text-red-400 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Tout effacer
            </button>
          </div>
          {solidBlocks.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/60">🏛️ Acquis Solides</span>
              <span className="text-[11px] font-bold" style={{ color: goldColor }}>{solidLabels.join(' · ')}</span>
            </div>
          )}
          {recentBlocks.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/60">🌱 Récents (Liaison)</span>
              <span className="text-[11px] font-bold" style={{ color: '#4ade80' }}>{recentLabels.join(' · ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Category cards */}
      <div className="space-y-4 flex-1">
        {/* Solid card */}
        <motion.button whileTap={{ scale: 0.97 }}
          onClick={() => { resetEntryForm(); setStep('solid-entry'); }}
          className="w-full rounded-2xl p-5 text-left space-y-2 transition-all"
          style={{ background: glassBg, border: `1.5px solid ${goldBorder}` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: goldBg }}>
              <Building2 className="h-5 w-5" style={{ color: goldColor }} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: goldColor }}>Mes Acquis Solides</h3>
              <p className="text-[10px] text-white/50">Appris il y a plus d'un mois</p>
            </div>
          </div>
          <p className="text-[11px] text-white/60 leading-relaxed pl-[52px]">
            Ces sourates sont bien ancrées. Elles seront révisées par l'algorithme de répétition espacée.
          </p>
        </motion.button>

        {/* Recent card */}
        <motion.button whileTap={{ scale: 0.97 }}
          onClick={() => { resetEntryForm(); setStep('recent-entry'); }}
          className="w-full rounded-2xl p-5 text-left space-y-2 transition-all"
          style={{ background: glassBg, border: '1.5px solid rgba(74,222,128,0.3)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.15)' }}>
              <Sprout className="h-5 w-5" style={{ color: '#4ade80' }} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: '#4ade80' }}>Mes Mémorisations Récentes</h3>
              <p className="text-[10px] text-white/50">Appris durant les 30 derniers jours</p>
            </div>
          </div>
          <p className="text-[11px] text-white/60 leading-relaxed pl-[52px]">
            Ces acquis récents nécessitent encore une récitation quotidienne (Liaison) avant d'être autonomes.
          </p>
        </motion.button>
      </div>

      {/* Footer buttons */}
      <div className="mt-6 space-y-2">
        {(solidBlocks.length > 0 || recentBlocks.length > 0) && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep('confirming')}
            className="w-full rounded-xl py-4 font-bold text-sm"
            style={{ background: `linear-gradient(135deg, ${goldColor}, #c4a030)`, color: '#1a2e1a',
              boxShadow: '0 4px 20px rgba(212,175,55,0.3)' }}>
            {(() => {
              const solidDesc = solidLabels.length > 0 ? solidLabels.join(', ') : '';
              const recentDesc = recentLabels.length > 0 ? recentLabels.join(', ') : '';
              if (solidDesc && recentDesc) return `✨ Confirmer (${solidDesc} + ${recentDesc})`;
              return `✨ Confirmer ${solidDesc || recentDesc}`;
            })()}
          </motion.button>
        )}

        <button onClick={handleSkip}
          className="w-full text-center text-xs text-white/40 py-2 transition-colors hover:text-white/60">
          Je n'ai encore rien mémorisé →
        </button>
      </div>
    </motion.div>
  );
}

// ─── PAGES TAB ───
function PagesTab({ intervals, onAdd, onRemove, onUpdate }: {
  intervals: PageInterval[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: 'start' | 'end', value: number) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="space-y-3">
      <p className="text-xs text-white/50 leading-relaxed">
        Indiquez les pages que vous avez mémorisées.
      </p>

      {intervals.map((interval, idx) => (
        <motion.div key={interval.id}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4" style={{ background: glassBg, border: `1px solid ${goldBorder}` }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-white/50">Intervalle {idx + 1}</span>
            {intervals.length > 1 && (
              <button onClick={() => onRemove(interval.id)} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                <X className="h-3.5 w-3.5 text-white/40" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1.5">De la page</p>
              <input type="text" inputMode="numeric" pattern="[0-9]*"
                value={interval.start === 0 ? '' : interval.start}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  onUpdate(interval.id, 'start', val === '' ? 0 : Math.min(604, parseInt(val)));
                }}
                onBlur={() => onUpdate(interval.id, 'start', Math.max(1, interval.start))}
                onFocus={e => e.target.select()}
                className="w-full bg-transparent text-white text-xl font-bold outline-none text-center [appearance:textfield] rounded-xl py-2"
                style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${glassBorder}`, fontSize: '16px' }}
              />
            </div>
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1.5">À la page</p>
              <input type="text" inputMode="numeric" pattern="[0-9]*"
                value={interval.end === 0 ? '' : interval.end}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  onUpdate(interval.id, 'end', val === '' ? 0 : Math.min(604, parseInt(val)));
                }}
                onBlur={() => onUpdate(interval.id, 'end', Math.max(interval.start, interval.end))}
                onFocus={e => e.target.select()}
                className="w-full bg-transparent text-white text-xl font-bold outline-none text-center [appearance:textfield] rounded-xl py-2"
                style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${glassBorder}`, fontSize: '16px' }}
              />
            </div>
          </div>
          <p className="text-center text-[10px] mt-2" style={{ color: goldColor }}>
            ≈ {Math.max(0, interval.end - interval.start + 1)} pages
          </p>
        </motion.div>
      ))}

      <motion.button whileTap={{ scale: 0.97 }} onClick={onAdd}
        className="w-full rounded-xl py-3 flex items-center justify-center gap-2 text-xs font-medium transition-all"
        style={{ background: glassBg, border: `1px dashed ${goldBorder}`, color: 'rgba(255,255,255,0.6)' }}>
        <Plus className="h-3.5 w-3.5" /> Ajouter un autre intervalle
      </motion.button>
    </motion.div>
  );
}

// ─── JUZ TAB ───
function JuzTab({ selected, onToggle }: { selected: Set<number>; onToggle: (n: number) => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="space-y-3">
      <p className="text-xs text-white/50 leading-relaxed">
        Sélectionnez les Juz (parties) que vous avez déjà mémorisés.
      </p>

      <div className="grid grid-cols-5 gap-2">
        {JUZ_DATA.map(juz => {
          const isSelected = selected.has(juz.number);
          return (
            <motion.button key={juz.number} whileTap={{ scale: 0.9 }}
              onClick={() => onToggle(juz.number)}
              className="aspect-square rounded-xl flex flex-col items-center justify-center transition-all relative overflow-hidden"
              style={{
                background: isSelected ? 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))' : glassBg,
                border: `1.5px solid ${isSelected ? goldBorderActive : glassBorder}`,
                boxShadow: isSelected ? '0 2px 12px rgba(212,175,55,0.2)' : 'none',
              }}>
              {isSelected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1 right-1">
                  <CheckCircle2 className="h-3 w-3" style={{ color: goldColor }} />
                </motion.div>
              )}
              <span className="text-base font-bold" style={{ color: isSelected ? goldColor : 'rgba(255,255,255,0.7)' }}>
                {juz.number}
              </span>
              <span className="text-[8px] mt-0.5" style={{ color: isSelected ? 'rgba(212,175,55,0.7)' : 'rgba(255,255,255,0.3)' }}>
                p.{juz.startPage}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-2 flex-wrap">
        <QuickButton label="Juz Amma (30)" onClick={() => { if (!selected.has(30)) onToggle(30); }} active={selected.has(30)} />
        <QuickButton label="Juz Tabarak (29)" onClick={() => { if (!selected.has(29)) onToggle(29); }} active={selected.has(29)} />
        <QuickButton label="Tout sélectionner" onClick={() => {
          for (let i = 1; i <= 30; i++) { if (!selected.has(i)) onToggle(i); }
        }} active={selected.size === 30} />
      </div>
    </motion.div>
  );
}

function QuickButton({ label, onClick, active }: { label: string; onClick: () => void; active: boolean }) {
  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onClick}
      className="rounded-xl px-3 py-2 text-[10px] font-medium transition-all"
      style={{
        background: active ? goldBg : glassBg,
        border: `1px solid ${active ? goldBorder : glassBorder}`,
        color: active ? goldColor : 'rgba(255,255,255,0.6)',
      }}>
      {label}
    </motion.button>
  );
}

// ─── SURAHS TAB ───
function SurahsTab({ surahs, selections, expandedSurah, searchQuery, onSearch, onToggle, onExpand, onUpdateVerses }: {
  surahs: typeof SURAHS;
  selections: Map<number, SurahSelection>;
  expandedSurah: number | null;
  searchQuery: string;
  onSearch: (q: string) => void;
  onToggle: (n: number) => void;
  onExpand: (n: number | null) => void;
  onUpdateVerses: (n: number, field: 'verseStart' | 'verseEnd', value: number) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="space-y-3">
      <input type="text" placeholder="Rechercher une sourate..."
        value={searchQuery} onChange={e => onSearch(e.target.value)}
        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
        style={{ background: glassBg, border: `1px solid ${glassBorder}`, color: 'white', fontSize: '16px' }}
      />

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.15)' }}>
        {surahs.map(s => {
          const sel = selections.get(s.number);
          const isSelected = !!sel?.selected;
          const isExpanded = expandedSurah === s.number && isSelected;

          return (
            <div key={s.number} style={{ borderBottom: `1px solid ${glassBorder}` }}>
              <div className="flex items-center px-3 py-2.5 gap-2"
                style={{ background: isSelected ? 'rgba(212,175,55,0.06)' : 'transparent' }}>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => onToggle(s.number)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    background: isSelected ? goldColor : 'rgba(255,255,255,0.08)',
                    border: `1.5px solid ${isSelected ? goldColor : 'rgba(255,255,255,0.2)'}`,
                  }}>
                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-[#1a2e1a]" />}
                </motion.button>
                <div className="flex-1 min-w-0" onClick={() => onToggle(s.number)}>
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 text-[10px] w-5 text-right">{s.number}</span>
                    <span className="text-white text-sm truncate">{s.name}</span>
                    <span className="text-white/30 text-[10px]">({s.versesCount}v)</span>
                  </div>
                </div>
                {isSelected && (
                  <button onClick={() => onExpand(isExpanded ? null : s.number)}
                    className="p-1.5 rounded-lg transition-colors" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-white/40" /> : <ChevronDown className="h-3.5 w-3.5 text-white/40" />}
                  </button>
                )}
              </div>

              <AnimatePresence>
                {isExpanded && sel && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="px-4 pb-3 pt-1">
                      <p className="text-[10px] text-white/40 mb-2">Plage de versets mémorisés :</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg p-2" style={{ background: 'rgba(0,0,0,0.2)' }}>
                          <p className="text-[9px] text-white/30 uppercase mb-1">Du verset</p>
                          <input type="text" inputMode="numeric" pattern="[0-9]*"
                            value={sel.verseStart || ''}
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, '');
                              onUpdateVerses(s.number, 'verseStart', val === '' ? 0 : Math.min(s.versesCount, parseInt(val)));
                            }}
                            onBlur={() => onUpdateVerses(s.number, 'verseStart', Math.max(1, sel.verseStart || 1))}
                            onFocus={e => e.target.select()}
                            className="w-full bg-transparent text-white text-sm font-bold outline-none text-center [appearance:textfield]"
                            style={{ fontSize: '16px' }}
                          />
                        </div>
                        <div className="rounded-lg p-2" style={{ background: 'rgba(0,0,0,0.2)' }}>
                          <p className="text-[9px] text-white/30 uppercase mb-1">Au verset</p>
                          <input type="text" inputMode="numeric" pattern="[0-9]*"
                            value={sel.verseEnd || ''}
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, '');
                              onUpdateVerses(s.number, 'verseEnd', val === '' ? 0 : Math.min(s.versesCount, parseInt(val)));
                            }}
                            onBlur={() => onUpdateVerses(s.number, 'verseEnd', Math.max(sel.verseStart || 1, sel.verseEnd || 1))}
                            onFocus={e => e.target.select()}
                            className="w-full bg-transparent text-white text-sm font-bold outline-none text-center [appearance:textfield]"
                            style={{ fontSize: '16px' }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
