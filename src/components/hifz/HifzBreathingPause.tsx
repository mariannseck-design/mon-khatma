import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Home } from 'lucide-react';

interface HifzBreathingPauseProps {
  onComplete: () => void;
  onPause?: () => void;
}

export default function HifzBreathingPause({ onComplete, onPause }: HifzBreathingPauseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 px-4"
    >
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(212,175,55,0.15)', border: '2px solid rgba(212,175,55,0.4)' }}
        >
          <CheckCircle2 className="h-10 w-10" style={{ color: '#d4af37' }} />
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-2"
      >
        <p
          className="text-sm font-medium uppercase tracking-widest"
          style={{ color: 'rgba(212,175,55,0.7)' }}
        >
          Étape A terminée
        </p>
        <h2
          className="text-xl font-bold"
          style={{ color: '#f0e6c8', fontFamily: "'Playfair Display', serif" }}
        >
          Préparation complète ✨
        </h2>
      </motion.div>

      {/* Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl p-4 max-w-sm space-y-2"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(212,175,55,0.2)',
        }}
      >
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,230,200,0.8)' }}>
          Tu as terminé la <strong style={{ color: '#d4af37' }}>compréhension</strong> et l'<strong style={{ color: '#d4af37' }}>imprégnation</strong>.
        </p>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,230,200,0.5)' }}>
          Tu peux continuer vers la mémorisation maintenant, ou revenir plus tard — ta progression est sauvegardée.
        </p>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <button
          onClick={onComplete}
          className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #d4af37, #c9a030)',
            color: '#1a2e1a',
            boxShadow: '0 4px 15px rgba(212,175,55,0.3)',
          }}
        >
          Continuer la mémorisation
          <ArrowRight className="h-4 w-4" />
        </button>

        {onPause && (
          <button
            onClick={onPause}
            className="w-full py-3 rounded-xl font-medium text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(240,230,200,0.7)',
              border: '1px solid rgba(240,230,200,0.15)',
            }}
          >
            <Home className="h-3.5 w-3.5" />
            Revenir plus tard
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
