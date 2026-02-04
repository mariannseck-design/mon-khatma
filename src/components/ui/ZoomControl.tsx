import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Type } from 'lucide-react';

const ZOOM_LEVELS = [16, 18, 20, 22, 24];
const ZOOM_LABELS = ['Petit', 'Normal', 'Grand', 'Très grand', 'Maximum'];

export function ZoomControl() {
  const [isOpen, setIsOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(() => {
    const saved = localStorage.getItem('app-zoom-level');
    return saved ? parseInt(saved, 10) : 2; // Default to "Grand" (20px)
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${ZOOM_LEVELS[zoomIndex]}px`;
    localStorage.setItem('app-zoom-level', zoomIndex.toString());
  }, [zoomIndex]);

  const zoomIn = () => {
    if (zoomIndex < ZOOM_LEVELS.length - 1) {
      setZoomIndex(zoomIndex + 1);
    }
  };

  const zoomOut = () => {
    if (zoomIndex > 0) {
      setZoomIndex(zoomIndex - 1);
    }
  };

  return (
    <div className="fixed bottom-32 right-5 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-16 right-0 bg-card rounded-2xl shadow-lg border border-border p-4 min-w-[180px]"
          >
            <p className="text-sm font-medium text-muted-foreground mb-3 text-center">
              Taille du texte
            </p>
            
            <div className="flex items-center justify-between gap-3 mb-3">
              <button
                onClick={zoomOut}
                disabled={zoomIndex === 0}
                className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center disabled:opacity-30 transition-all active:scale-95"
              >
                <ZoomOut className="h-5 w-5 text-foreground" />
              </button>
              
              <span className="text-lg font-semibold text-foreground flex-1 text-center">
                {ZOOM_LABELS[zoomIndex]}
              </span>
              
              <button
                onClick={zoomIn}
                disabled={zoomIndex === ZOOM_LEVELS.length - 1}
                className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center disabled:opacity-30 transition-all active:scale-95"
              >
                <ZoomIn className="h-5 w-5 text-foreground" />
              </button>
            </div>

            {/* Visual indicator */}
            <div className="flex justify-center gap-1.5">
              {ZOOM_LEVELS.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === zoomIndex 
                      ? 'w-6 bg-primary' 
                      : 'w-2 bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-success shadow-xl flex items-center justify-center border-4 border-white"
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <Type className="h-7 w-7 text-primary-foreground" />
      </motion.button>
    </div>
  );
}
