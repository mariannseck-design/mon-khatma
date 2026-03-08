import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle2, Sparkles, ArrowRight, ArrowLeft, Layers } from 'lucide-react';
import { SURAHS } from '@/lib/surahData';
import { surahsToVerseBlocks, pageRangeToVerseBlocks, injectMemorizedVerses, COMMON_SURAH_GROUPS, JUZ_AMMA_SURAHS } from '@/lib/hifzUtils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface HifzDiagnosticProps {
  onComplete: () => void;
  onSkip: () => void;
}

type Mode = 'choice' | 'surahs' | 'pages' | 'confirming' | 'done';

export default function HifzDiagnostic({ onComplete, onSkip }: HifzDiagnosticProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('choice');
  const [selectedSurahs, setSelectedSurahs] = useState<Set<number>>(new Set());
  const [pageStart, setPageStart] = useState(1);
  const [pageEnd, setPageEnd] = useState(20);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return SURAHS;
    const q = searchQuery.toLowerCase();
    return SURAHS.filter(
      s => s.name.toLowerCase().includes(q) || s.nameFr.toLowerCase().includes(q) || String(s.number).includes(q)
    );
  }, [searchQuery]);

  const toggleSurah = (num: number) => {
    setSelectedSurahs(prev => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const toggleGroup = (surahNums: number[]) => {
    setSelectedSurahs(prev => {
      const next = new Set(prev);
      const allSelected = surahNums.every(n => next.has(n));
      if (allSelected) {
        surahNums.forEach(n => next.delete(n));
      } else {
        surahNums.forEach(n => next.add(n));
      }
      return next;
    });
  };

  const totalVersesSelected = useMemo(() => {
    if (mode === 'surahs' || mode === 'confirming') {
      return Array.from(selectedSurahs).reduce((sum, num) => {
        const s = SURAHS.find(s => s.number === num);
        return sum + (s?.versesCount || 0);
      }, 0);
    }
    // Pages mode: approximate
    return (pageEnd - pageStart + 1) * 15;
  }, [selectedSurahs, pageStart, pageEnd, mode]);

  const handleConfirm = async () => {
    if (!user) return;
    setSaving(true);

    try {
      let blocks;
      if (selectedSurahs.size > 0) {
        blocks = surahsToVerseBlocks(Array.from(selectedSurahs).sort((a, b) => a - b));
      } else {
        blocks = pageRangeToVerseBlocks(pageStart, pageEnd);
      }

      const result = await injectMemorizedVerses(user.id, blocks);

      // Mark diagnostic as completed
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);

      setMode('done');

      toast({
        title: 'Acquis enregistrés ✨',
        description: `${result.count} blocs ajoutés à ton programme de révision.`,
      });

      setTimeout(() => onComplete(), 2000);
    } catch (err) {
      console.error('Diagnostic error:', err);
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder tes acquis.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (user) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);
    }
    onSkip();
  };

  // ─── Animations ───
  const pageAnim = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
    transition: { duration: 0.3 },
  };

  // ─── CHOICE SCREEN ───
  if (mode === 'choice') {
    return (
      <motion.div {...pageAnim} className="space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}
            >
              <BookOpen className="h-8 w-8" style={{ color: '#d4af37' }} />
            </div>
          </div>
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}
          >
            Qu'avez-vous déjà mémorisé ?
          </h2>
          <p className="text-sm text-white/70 leading-relaxed max-w-xs mx-auto">
            Ce diagnostic nous permet d'adapter votre programme de révision et de démarrer votre Hifz au bon endroit.
          </p>
        </div>

        <div className="space-y-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setMode('surahs')}
            className="w-full rounded-2xl p-5 text-left transition-all"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.3)' }}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">📖</div>
              <div className="flex-1">
                <p className="font-semibold text-white">Par Sourates</p>
                <p className="text-xs text-white/50 mt-0.5">Sélectionnez les sourates que vous connaissez</p>
              </div>
              <ArrowRight className="h-5 w-5 text-white/30" />
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setMode('pages')}
            className="w-full rounded-2xl p-5 text-left transition-all"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.3)' }}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">📄</div>
              <div className="flex-1">
                <p className="font-semibold text-white">Par Pages</p>
                <p className="text-xs text-white/50 mt-0.5">Indiquez une plage de pages du Mushaf</p>
              </div>
              <ArrowRight className="h-5 w-5 text-white/30" />
            </div>
          </motion.button>
        </div>

        <button
          onClick={handleSkip}
          className="w-full text-center text-sm text-white/40 py-3 transition-colors hover:text-white/60"
        >
          Je n'ai encore rien mémorisé →
        </button>
      </motion.div>
    );
  }

  // ─── SURAHS SELECTION ───
  if (mode === 'surahs') {
    return (
      <motion.div {...pageAnim} className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setMode('choice')} className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <ArrowLeft className="h-4 w-4 text-white/70" />
          </button>
          <h2 className="text-lg font-bold" style={{ color: '#d4af37', fontFamily: "'Playfair Display', serif" }}>
            Sourates mémorisées
          </h2>
        </div>

        {/* Quick groups */}
        <div className="space-y-2">
          <p className="text-xs text-white/50 uppercase tracking-wider">Sélection rapide</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_SURAH_GROUPS.map(g => {
              const allSelected = g.surahs.every(n => selectedSurahs.has(n));
              return (
                <button
                  key={g.label}
                  onClick={() => toggleGroup(g.surahs)}
                  className="rounded-xl px-3 py-2 text-xs font-medium transition-all"
                  style={{
                    background: allSelected ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${allSelected ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    color: allSelected ? '#d4af37' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {g.icon} {g.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Rechercher une sourate..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'white',
            fontSize: '16px',
          }}
        />

        {/* Surah list */}
        <div
          className="rounded-2xl max-h-[40vh] overflow-y-auto space-y-0.5"
          style={{ background: 'rgba(0,0,0,0.2)' }}
        >
          {filteredSurahs.map(s => {
            const isSelected = selectedSurahs.has(s.number);
            return (
              <button
                key={s.number}
                onClick={() => toggleSurah(s.number)}
                className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors"
                style={{
                  background: isSelected ? 'rgba(212,175,55,0.1)' : 'transparent',
                }}
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isSelected ? '#d4af37' : 'rgba(255,255,255,0.1)',
                    border: `1px solid ${isSelected ? '#d4af37' : 'rgba(255,255,255,0.2)'}`,
                  }}
                >
                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-[#1a2e1a]" />}
                </div>
                <span className="text-white/40 text-xs w-6 text-right">{s.number}</span>
                <div className="flex-1">
                  <span className="text-white text-sm">{s.name}</span>
                  <span className="text-white/40 text-xs ml-2">({s.versesCount}v)</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="space-y-3">
          {selectedSurahs.size > 0 && (
            <p className="text-center text-xs" style={{ color: '#d4af37' }}>
              {selectedSurahs.size} sourate{selectedSurahs.size > 1 ? 's' : ''} · ~{totalVersesSelected} versets
            </p>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setMode('confirming')}
            disabled={selectedSurahs.size === 0}
            className="w-full rounded-xl py-4 font-bold text-base transition-all"
            style={{
              background: selectedSurahs.size > 0 ? 'linear-gradient(135deg, #d4af37, #c4a030)' : 'rgba(255,255,255,0.1)',
              color: selectedSurahs.size > 0 ? '#1a2e1a' : 'rgba(255,255,255,0.3)',
              opacity: selectedSurahs.size > 0 ? 1 : 0.5,
            }}
          >
            Valider mes acquis
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ─── PAGES SELECTION ───
  if (mode === 'pages') {
    return (
      <motion.div {...pageAnim} className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setMode('choice')} className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <ArrowLeft className="h-4 w-4 text-white/70" />
          </button>
          <h2 className="text-lg font-bold" style={{ color: '#d4af37', fontFamily: "'Playfair Display', serif" }}>
            Pages mémorisées
          </h2>
        </div>

        <p className="text-sm text-white/60 leading-relaxed">
          Indiquez la plage de pages du Mushaf que vous avez déjà mémorisées (1 à 604).
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.3)' }}
          >
            <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Page début</p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pageStart === 0 ? '' : pageStart}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setPageStart(val === '' ? 0 : Math.min(604, parseInt(val)));
              }}
              onBlur={() => setPageStart(prev => Math.max(1, prev))}
              className="w-full bg-transparent text-white text-2xl font-bold outline-none text-center [appearance:textfield]"
              style={{ fontSize: '16px' }}
            />
          </div>
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.3)' }}
          >
            <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Page fin</p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pageEnd === 0 ? '' : pageEnd}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setPageEnd(val === '' ? 0 : Math.min(604, parseInt(val)));
              }}
              onBlur={() => setPageEnd(prev => Math.max(pageStart, prev))}
              className="w-full bg-transparent text-white text-2xl font-bold outline-none text-center [appearance:textfield]"
              style={{ fontSize: '16px' }}
            />
          </div>
        </div>

        <div
          className="rounded-xl p-3 text-center"
          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}
        >
          <p className="text-xs" style={{ color: '#d4af37' }}>
            ≈ {pageEnd - pageStart + 1} pages · ~{(pageEnd - pageStart + 1) * 15} versets
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            // Convert pages to surah blocks for confirmation
            setMode('confirming');
          }}
          className="w-full rounded-xl py-4 font-bold text-base"
          style={{
            background: 'linear-gradient(135deg, #d4af37, #c4a030)',
            color: '#1a2e1a',
          }}
        >
          Valider mes acquis
        </motion.button>
      </motion.div>
    );
  }

  // ─── CONFIRMATION ───
  if (mode === 'confirming') {
    const summaryItems = selectedSurahs.size > 0
      ? Array.from(selectedSurahs).sort((a, b) => a - b).map(num => {
          const s = SURAHS.find(s => s.number === num);
          return s ? `${s.name} (${s.versesCount}v)` : '';
        }).filter(Boolean)
      : [`Pages ${pageStart} → ${pageEnd}`];

    return (
      <motion.div {...pageAnim} className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode(selectedSurahs.size > 0 ? 'surahs' : 'pages')}
            className="p-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <ArrowLeft className="h-4 w-4 text-white/70" />
          </button>
          <h2 className="text-lg font-bold" style={{ color: '#d4af37', fontFamily: "'Playfair Display', serif" }}>
            Confirmation
          </h2>
        </div>

        <div className="text-center space-y-2">
          <Layers className="h-10 w-10 mx-auto" style={{ color: '#d4af37' }} />
          <p className="text-white/80 text-sm">
            Ces acquis seront ajoutés à votre programme de révision avec des dates étalées sur 14 jours.
          </p>
        </div>

        <div
          className="rounded-2xl p-4 max-h-[30vh] overflow-y-auto space-y-1"
          style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(212,175,55,0.15)' }}
        >
          {summaryItems.map((item, i) => (
            <p key={i} className="text-sm text-white/70 flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#d4af37' }} />
              {item}
            </p>
          ))}
        </div>

        <div className="space-y-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleConfirm}
            disabled={saving}
            className="w-full rounded-xl py-4 font-bold text-base"
            style={{
              background: 'linear-gradient(135deg, #d4af37, #c4a030)',
              color: '#1a2e1a',
            }}
          >
            {saving ? 'Enregistrement...' : '✨ Confirmer et continuer'}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ─── DONE ───
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4"
    >
      <Sparkles className="h-12 w-12" style={{ color: '#d4af37' }} />
      <h2 className="text-xl font-bold" style={{ color: '#d4af37', fontFamily: "'Playfair Display', serif" }}>
        Acquis enregistrés !
      </h2>
      <p className="text-sm text-white/70 max-w-xs">
        Votre programme de révision a été créé. Les révisions seront réparties progressivement.
      </p>
    </motion.div>
  );
}
