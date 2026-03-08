import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Moon, Sun, Play, Pause, Loader2, BookOpen, Image, Type, ChevronRight, Palette, Languages } from 'lucide-react';
import { RECITERS } from '@/hooks/useQuranAudio';

export const TRANSLATION_EDITIONS = [
  { id: 'fr.hamidullah', label: 'Français (Hamidullah)', lang: '🇫🇷' },
  { id: 'en.sahih', label: 'English (Sahih Int.)', lang: '🇬🇧' },
  { id: 'fr.leclerc', label: 'Français (Montada)', lang: '🇫🇷' },
  { id: 'en.pickthall', label: 'English (Pickthall)', lang: '🇬🇧' },
];

interface ReaderSettingsPanelProps {
  viewMode: 'image' | 'text';
  onViewModeChange: (mode: 'image' | 'text') => void;
  nightMode: boolean;
  onNightModeChange: (on: boolean) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  isPlaying: boolean;
  audioLoading: boolean;
  onTogglePlay: () => void;
  reciter: string;
  onReciterChange: (id: string) => void;
  onShowSurahDrawer?: () => void;
  textSizeIndex?: number;
  textSizes?: Array<{ label: string; value: number }>;
  onTextSizeIndexChange?: (index: number) => void;
  textModeDisabled?: boolean;
  audioStartVerse?: number;
  audioEndVerse?: number;
  onAudioStartVerseChange?: (v: number | undefined) => void;
  onAudioEndVerseChange?: (v: number | undefined) => void;
  isOffline?: boolean;
  tajweedEnabled?: boolean;
  onTajweedChange?: (enabled: boolean) => void;
  translationEnabled?: boolean;
  onTranslationChange?: (enabled: boolean) => void;
  translationEdition?: string;
  onTranslationEditionChange?: (edition: string) => void;
}

const FONT_SIZE_PRESETS = [
  { label: 'Petit', value: 16 },
  { label: 'Moyen', value: 22 },
  { label: 'Grand', value: 28 },
  { label: 'Très Grand', value: 36 },
  { label: 'Mushaf', value: 42 },
];

export default function ReaderSettingsPanel({
  viewMode, onViewModeChange,
  nightMode, onNightModeChange,
  fontSize, onFontSizeChange,
  isPlaying, audioLoading, onTogglePlay,
  reciter, onReciterChange,
  onShowSurahDrawer,
  textSizeIndex,
  textSizes,
  onTextSizeIndexChange,
  textModeDisabled,
  audioStartVerse,
  audioEndVerse,
  onAudioStartVerseChange,
  onAudioEndVerseChange,
  isOffline,
  tajweedEnabled,
  onTajweedChange,
  translationEnabled,
  onTranslationChange,
  translationEdition,
  onTranslationEditionChange,
}: ReaderSettingsPanelProps) {
  const [open, setOpen] = useState(false);

  const activeSizes = textSizes || FONT_SIZE_PRESETS;
  const activeIndex = textSizeIndex ?? activeSizes.findIndex(s => s.value === fontSize);

  return (
    <>
      {/* Settings gear button */}
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ color: '#4a9a9a' }}
      >
        <Settings className="h-4 w-4" />
      </button>

      {/* Settings panel overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md rounded-t-3xl flex flex-col"
              style={{
                background: nightMode ? '#1a2e1a' : 'linear-gradient(135deg, #8ed1c4, #a0d9ce)',
                color: nightMode ? '#d4c9a8' : '#1a3a3a',
                border: `1px solid ${nightMode ? 'rgba(90,180,180,0.15)' : 'rgba(212,175,55,0.4)'}`,
                borderBottom: 'none',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
                maxHeight: '80vh',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fixed Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
                <h3 className="text-lg font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: nightMode ? '#d4c9a8' : '#6b5417' }}>
                  Paramètres
                </h3>
                <button onClick={() => setOpen(false)} className="p-1 rounded-full" style={{ background: nightMode ? 'rgba(122,139,111,0.15)' : 'rgba(255,255,255,0.2)' }}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto px-5 pb-8 flex-1" style={{ WebkitOverflowScrolling: 'touch' }}>

              {/* Grouped: Sourate + Versets */}
              {(onShowSurahDrawer || (onAudioStartVerseChange && onAudioEndVerseChange)) && (
                <div
                  className="mb-4 p-3 rounded-2xl"
                  style={{
                    background: nightMode ? 'rgba(90,180,180,0.06)' : 'rgba(255,255,255,0.12)',
                    border: `1px solid ${nightMode ? 'rgba(90,180,180,0.12)' : 'rgba(212,175,55,0.25)'}`,
                  }}
                >
                  {onShowSurahDrawer && (
                    <button
                      onClick={() => { onShowSurahDrawer(); setOpen(false); }}
                      className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-medium transition-all"
                      style={{ background: nightMode ? 'rgba(90,180,180,0.08)' : 'rgba(255,255,255,0.2)', border: `1px solid ${nightMode ? 'rgba(90,180,180,0.12)' : 'rgba(212,175,55,0.2)'}` }}
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" style={{ color: '#4a9a9a' }} />
                        Choisir une sourate
                      </span>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </button>
                  )}
                  {onAudioStartVerseChange && onAudioEndVerseChange && (
                    <div className={`flex items-center gap-2 ${onShowSurahDrawer ? 'mt-2.5' : ''}`}>
                      <div className="flex-1">
                        <label className="text-[10px] opacity-60 mb-0.5 block">Du verset</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Début"
                          value={audioStartVerse ?? ''}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[^0-9]/g, '');
                            const v = raw ? parseInt(raw) : undefined;
                            onAudioStartVerseChange(v && v > 0 ? v : undefined);
                          }}
                          onFocus={(e) => e.target.select()}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full py-1.5 px-2 rounded-lg text-sm border-0 outline-none text-center"
                          style={{
                            background: nightMode ? 'rgba(90,180,180,0.08)' : 'rgba(255,255,255,0.2)',
                            color: 'inherit',
                            fontSize: '16px',
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] opacity-60 mb-0.5 block">Au verset</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Fin"
                          value={audioEndVerse ?? ''}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[^0-9]/g, '');
                            const v = raw ? parseInt(raw) : undefined;
                            onAudioEndVerseChange(v && v > 0 ? v : undefined);
                          }}
                          onFocus={(e) => e.target.select()}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full py-1.5 px-2 rounded-lg text-sm border-0 outline-none text-center"
                          style={{
                            background: nightMode ? 'rgba(90,180,180,0.08)' : 'rgba(255,255,255,0.2)',
                            color: 'inherit',
                            fontSize: '16px',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* View Mode Toggle */}
              {!textModeDisabled && (
                <div className="mb-4">
                  <p className="text-xs font-medium mb-2 opacity-70">Mode d'affichage</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => !isOffline && onViewModeChange('image')}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: viewMode === 'image' ? (nightMode ? 'rgba(90,180,180,0.2)' : 'rgba(255,255,255,0.35)') : (nightMode ? 'rgba(90,180,180,0.05)' : 'rgba(255,255,255,0.15)'),
                        border: viewMode === 'image' ? `1.5px solid ${nightMode ? 'rgba(90,180,180,0.4)' : 'rgba(180,150,60,0.5)'}` : '1.5px solid transparent',
                        opacity: isOffline ? 0.4 : 1,
                        cursor: isOffline ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Image className="h-4 w-4" /> {isOffline ? 'Mushaf (hors-ligne)' : 'Mushaf'}
                    </button>
                    <button
                      onClick={() => onViewModeChange('text')}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: viewMode === 'text' ? (nightMode ? 'rgba(90,180,180,0.2)' : 'rgba(255,255,255,0.35)') : (nightMode ? 'rgba(90,180,180,0.05)' : 'rgba(255,255,255,0.15)'),
                        border: viewMode === 'text' ? `1.5px solid ${nightMode ? 'rgba(90,180,180,0.4)' : 'rgba(180,150,60,0.5)'}` : '1.5px solid transparent',
                      }}
                    >
                      <Type className="h-4 w-4" /> Texte
                    </button>
                  </div>
                </div>
              )}

              {/* Tajweed Toggle */}
              {!textModeDisabled && viewMode === 'text' && onTajweedChange && (
                <div className="mb-4">
                  <button
                    onClick={() => onTajweedChange(!tajweedEnabled)}
                    className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl text-sm font-medium transition-all"
                    style={{ background: nightMode ? 'rgba(90,180,180,0.08)' : 'rgba(255,255,255,0.15)' }}
                  >
                    <span className="flex items-center gap-2">
                      <Palette className="h-4 w-4" style={{ color: tajweedEnabled ? '#d63031' : (nightMode ? '#4a9a9a' : '#8a6d1b') }} />
                      Couleurs Tajwid
                    </span>
                    <div
                      className="w-10 h-6 rounded-full relative transition-colors"
                      style={{ background: tajweedEnabled ? '#4a9a9a' : 'rgba(255,255,255,0.3)' }}
                    >
                      <div
                        className="w-4 h-4 rounded-full absolute top-1 transition-all"
                        style={{
                          background: tajweedEnabled ? '#f7f3eb' : '#6b5417',
                          left: tajweedEnabled ? '22px' : '4px',
                        }}
                      />
                    </div>
                  </button>
                </div>
              )}

              {/* Translation Toggle */}
              {onTranslationChange && (
                <div className="mb-4">
                  <button
                    onClick={() => onTranslationChange(!translationEnabled)}
                    className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl text-sm font-medium transition-all"
                    style={{ background: nightMode ? 'rgba(90,180,180,0.08)' : 'rgba(255,255,255,0.15)' }}
                  >
                    <span className="flex items-center gap-2">
                      <Languages className="h-4 w-4" style={{ color: translationEnabled ? '#4a9a9a' : (nightMode ? '#4a9a9a' : '#8a6d1b') }} />
                      Traduction
                    </span>
                    <div
                      className="w-10 h-6 rounded-full relative transition-colors"
                      style={{ background: translationEnabled ? '#4a9a9a' : 'rgba(255,255,255,0.3)' }}
                    >
                      <div
                        className="w-4 h-4 rounded-full absolute top-1 transition-all"
                        style={{
                          background: translationEnabled ? '#f7f3eb' : '#6b5417',
                          left: translationEnabled ? '22px' : '4px',
                        }}
                      />
                    </div>
                  </button>
                  {translationEnabled && onTranslationEditionChange && (
                    <div className="mt-2 grid grid-cols-2 gap-1.5">
                      {TRANSLATION_EDITIONS.map((ed) => (
                        <button
                          key={ed.id}
                          onClick={() => onTranslationEditionChange(ed.id)}
                          className="py-2 px-2 rounded-xl text-xs font-medium transition-all text-center"
                          style={{
                            background: translationEdition === ed.id
                              ? (nightMode ? 'rgba(90,180,180,0.2)' : 'rgba(255,255,255,0.35)')
                              : (nightMode ? 'rgba(90,180,180,0.05)' : 'rgba(255,255,255,0.15)'),
                            border: translationEdition === ed.id
                              ? `1.5px solid ${nightMode ? 'rgba(90,180,180,0.4)' : 'rgba(180,150,60,0.5)'}`
                              : '1.5px solid transparent',
                          }}
                        >
                          {ed.lang} {ed.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Text Size */}
              {!textModeDisabled && viewMode === 'text' && (
                <div className="mb-4">
                  <p className="text-xs font-medium mb-2 opacity-70">Taille du texte</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {activeSizes.map((size, idx) => (
                      <button
                        key={size.label}
                        onClick={() => onTextSizeIndexChange ? onTextSizeIndexChange(idx) : onFontSizeChange(size.value)}
                        className="py-2 rounded-xl text-xs font-medium transition-all text-center"
                        style={{
                          background: (activeIndex === idx)
                            ? (nightMode ? 'rgba(90,180,180,0.2)' : 'rgba(255,255,255,0.35)')
                            : (nightMode ? 'rgba(90,180,180,0.05)' : 'rgba(255,255,255,0.15)'),
                          border: (activeIndex === idx)
                            ? `1.5px solid ${nightMode ? 'rgba(90,180,180,0.4)' : 'rgba(180,150,60,0.5)'}`
                            : '1.5px solid transparent',
                        }}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Night Mode */}
              <div className="mb-4">
                <p className="text-xs font-medium mb-2 opacity-70">Luminosité</p>
                <button
                  onClick={() => onNightModeChange(!nightMode)}
                  className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl text-sm font-medium transition-all"
                  style={{ background: nightMode ? 'rgba(90,180,180,0.08)' : 'rgba(255,255,255,0.15)' }}
                >
                  <span className="flex items-center gap-2">
                    {nightMode ? <Moon className="h-4 w-4" style={{ color: '#4a9a9a' }} /> : <Sun className="h-4 w-4" style={{ color: '#8a6d1b' }} />}
                    {nightMode ? 'Mode nuit activé' : 'Mode jour'}
                  </span>
                  <div
                    className="w-10 h-6 rounded-full relative transition-colors"
                    style={{ background: nightMode ? '#4a9a9a' : 'rgba(255,255,255,0.3)' }}
                  >
                    <div
                      className="w-4 h-4 rounded-full absolute top-1 transition-all"
                      style={{
                        background: nightMode ? '#f7f3eb' : '#6b5417',
                        left: nightMode ? '22px' : '4px',
                      }}
                    />
                  </div>
                </button>
              </div>

              {/* Audio */}
              <div style={{ opacity: isOffline ? 0.4 : 1, pointerEvents: isOffline ? 'none' : 'auto' }}>
                <p className="text-xs font-medium mb-2 opacity-70">
                  Récitation audio {isOffline && <span className="text-[10px]">(hors-ligne)</span>}
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); if (!isOffline) onTogglePlay(); }}
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: isPlaying ? '#4a9a9a' : (nightMode ? 'rgba(90,180,180,0.15)' : 'rgba(255,255,255,0.25)') }}
                  >
                    {audioLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#f0ead9' }} />
                    ) : isPlaying ? (
                      <Pause className="h-5 w-5" style={{ color: '#f0ead9' }} />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" style={{ color: nightMode ? '#4a9a9a' : '#6b5417' }} />
                    )}
                  </button>
                  <select
                    value={reciter}
                    onChange={(e) => onReciterChange(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 py-2 px-3 rounded-xl text-sm border-0 outline-none"
                    style={{
                      background: nightMode ? 'rgba(90,180,180,0.08)' : 'rgba(255,255,255,0.2)',
                      color: 'inherit',
                    }}
                  >
                    {RECITERS.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              </div>{/* end scrollable */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
