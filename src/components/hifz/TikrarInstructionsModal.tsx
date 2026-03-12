import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Star, Heart } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TikrarInstructionsModal({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl p-5 space-y-5"
            style={{
              background: 'linear-gradient(135deg, #065f46, #064e3b)',
              border: '1px solid rgba(212,175,55,0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <X className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.7)' }} />
            </button>

            {/* Title */}
            <div className="text-center space-y-1">
              <h3
                className="text-lg font-bold"
                style={{ color: '#d4af37', fontFamily: "'Playfair Display', serif" }}
              >
                Réussir votre Tikrar Final
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                L'objectif est d'ancrer définitivement ce passage dans votre cœur par la répétition.
              </p>
            </div>

            {/* Section A */}
            <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 shrink-0" style={{ color: '#d4af37' }} />
                <h4 className="text-sm font-bold" style={{ color: '#f0e6c8' }}>
                  Section A — Choisissez votre rythme
                </h4>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Si le défi des 24h est trop intense, vous pouvez répartir vos 40 récitations :
              </p>
              <ul className="space-y-1.5 pl-1">
                {[
                  { label: 'Option 2 jours', detail: '20 récitations / jour' },
                  { label: 'Option 3 jours', detail: '15 récitations / jour' },
                  { label: 'Option 4 jours', detail: '10 récitations / jour' },
                ].map(opt => (
                  <li key={opt.label} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    <span style={{ color: '#d4af37' }}>•</span>
                    <span>
                      <strong style={{ color: '#f0e6c8' }}>{opt.label}</strong> : {opt.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section B */}
            <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 shrink-0" style={{ color: '#d4af37' }} />
                <h4 className="text-sm font-bold" style={{ color: '#f0e6c8' }}>
                  Section B — La règle de l'excellence
                </h4>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                La récitation doit se faire <strong style={{ color: '#f0e6c8' }}>exclusivement de mémoire</strong> (sans regarder le Mushaf) et sans aucune faute.
              </p>
              <p className="text-xs leading-relaxed font-semibold" style={{ color: '#f87171' }}>
                ⚠️ Important : Si vous commettez une erreur au milieu d'une sourate, vous devez impérativement la reprendre depuis le début pour valider votre répétition.
              </p>
            </div>

            {/* Section C */}
            <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Heart className="h-4 w-4 shrink-0" style={{ color: '#d4af37' }} />
                <h4 className="text-sm font-bold" style={{ color: '#f0e6c8' }}>
                  Section C — Gérez votre énergie
                </h4>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Ne vous laissez pas impressionner par le nombre ! Accomplir 40 récitations est un défi d'<strong style={{ color: '#f0e6c8' }}>endurance</strong>, pas de vitesse.
              </p>
              <ul className="space-y-1.5 pl-1">
                <li className="flex items-start gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <span style={{ color: '#d4af37' }}>•</span>
                  <span>
                    <strong style={{ color: '#f0e6c8' }}>Fractionnez vos sessions</strong> : vous n'êtes absolument pas obligée de faire les 40 récitations en une seule assise.
                  </span>
                </li>
                <li className="flex items-start gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <span style={{ color: '#d4af37' }}>•</span>
                  <span>
                    <strong style={{ color: '#f0e6c8' }}>Écoutez votre corps</strong> : vous pouvez faire plusieurs sessions dans la journée (par exemple : 10 après chaque prière) pour maintenir une concentration totale.
                  </span>
                </li>
              </ul>
            </div>

            {/* Conclusion */}
            <p className="text-center text-xs italic" style={{ color: 'rgba(212,175,55,0.8)' }}>
              Qu'Allah (عز وجل) facilite votre mémorisation. 🤲
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
