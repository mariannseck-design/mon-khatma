import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Type, Moon, Sun, Play, Pause, Loader2, Minus, Plus, BookOpen, Image } from 'lucide-react';
import { RECITERS } from '@/hooks/useQuranAudio';

interface ReaderSettingsPanelProps {
  // View mode
  viewMode: 'image' | 'text';
  onViewModeChange: (mode: 'image' | 'text') => void;
  // Night mode
  nightMode: boolean;
  onNightModeChange: (on: boolean) => void;
  // Font size (text mode)
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  // Audio
  isPlaying: boolean;
  audioLoading: boolean;
  onTogglePlay: () => void;
  reciter: string;
  onReciterChange: (id: string) => void;
}

export default function ReaderSettingsPanel({
  viewMode, onViewModeChange,
  nightMode, onNightModeChange,
  fontSize, onFontSizeChange,
  isPlaying, audioLoading, onTogglePlay,
  reciter, onReciterChange,
}: ReaderSettingsPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating settings button */}
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(122, 139, 111, 0.35)', backdropFilter: 'blur(8px)' }}
      >
        <Settings className="h-5 w-5" style={{ color: '#e8e2d0' }} />
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
              className="w-full max-w-md rounded-t-3xl p-5 pb-8"
              style={{
                background: nightMode ? '#1a2e1a' : '#f7f3eb',
                color: nightMode ? '#d4c9a8' : '#2d3a25',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Paramètres
                </h3>
                <button onClick={() => setOpen(false)} className="p-1 rounded-full" style={{ background: 'rgba(122,139,111,0.15)' }}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="mb-4">
                <p className="text-xs font-medium mb-2 opacity-70">Mode d'affichage</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewModeChange('image')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: viewMode === 'image' ? 'rgba(122,139,111,0.3)' : 'rgba(122,139,111,0.08)',
                      border: viewMode === 'image' ? '1.5px solid rgba(122,139,111,0.5)' : '1.5px solid transparent',
                    }}
                  >
                    <Image className="h-4 w-4" /> Mushaf
                  </button>
                  <button
                    onClick={() => onViewModeChange('text')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: viewMode === 'text' ? 'rgba(122,139,111,0.3)' : 'rgba(122,139,111,0.08)',
                      border: viewMode === 'text' ? '1.5px solid rgba(122,139,111,0.5)' : '1.5px solid transparent',
                    }}
                  >
                    <Type className="h-4 w-4" /> Texte
                  </button>
                </div>
              </div>

              {/* Night Mode */}
              <div className="mb-4">
                <p className="text-xs font-medium mb-2 opacity-70">Luminosité</p>
                <button
                  onClick={() => onNightModeChange(!nightMode)}
                  className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl text-sm font-medium transition-all"
                  style={{ background: 'rgba(122,139,111,0.08)' }}
                >
                  <span className="flex items-center gap-2">
                    {nightMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    {nightMode ? 'Mode nuit activé' : 'Mode jour'}
                  </span>
                  <div
                    className="w-10 h-6 rounded-full relative transition-colors"
                    style={{ background: nightMode ? '#7a8b6f' : 'rgba(122,139,111,0.25)' }}
                  >
                    <div
                      className="w-4 h-4 rounded-full absolute top-1 transition-all"
                      style={{
                        background: nightMode ? '#f7f3eb' : '#7a8b6f',
                        left: nightMode ? '22px' : '4px',
                      }}
                    />
                  </div>
                </button>
              </div>

              {/* Font Size (text mode) */}
              {viewMode === 'text' && (
                <div className="mb-4">
                  <p className="text-xs font-medium mb-2 opacity-70">Taille du texte</p>
                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ background: 'rgba(122,139,111,0.08)' }}>
                    <button
                      onClick={() => onFontSizeChange(Math.max(16, fontSize - 2))}
                      className="p-1.5 rounded-lg" style={{ background: 'rgba(122,139,111,0.2)' }}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-2xl font-bold" style={{ fontFamily: "'Scheherazade New', serif" }}>
                        بسم
                      </span>
                      <p className="text-xs opacity-50 mt-0.5">{fontSize}px</p>
                    </div>
                    <button
                      onClick={() => onFontSizeChange(Math.min(48, fontSize + 2))}
                      className="p-1.5 rounded-lg" style={{ background: 'rgba(122,139,111,0.2)' }}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Audio */}
              <div>
                <p className="text-xs font-medium mb-2 opacity-70">Récitation audio</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: isPlaying ? '#7a8b6f' : 'rgba(122,139,111,0.2)' }}
                  >
                    {audioLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#f0ead9' }} />
                    ) : isPlaying ? (
                      <Pause className="h-5 w-5" style={{ color: '#f0ead9' }} />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" style={{ color: nightMode ? '#d4c9a8' : '#2d3a25' }} />
                    )}
                  </button>
                  <select
                    value={reciter}
                    onChange={(e) => onReciterChange(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 py-2 px-3 rounded-xl text-sm border-0 outline-none"
                    style={{
                      background: 'rgba(122,139,111,0.08)',
                      color: 'inherit',
                    }}
                  >
                    {RECITERS.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
