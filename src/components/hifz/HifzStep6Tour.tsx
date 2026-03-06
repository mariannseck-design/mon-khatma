import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Check } from 'lucide-react';
import HifzStepWrapper from './HifzStepWrapper';

const DIFFICULTY_BUTTONS = [
  { value: 'hard', label: 'Difficile', color: '#dc6464', bg: 'rgba(220,100,100,0.15)', border: 'rgba(220,100,100,0.3)' },
  { value: 'good', label: 'Bien', color: '#d4af37', bg: 'rgba(212,175,55,0.15)', border: 'rgba(212,175,55,0.3)' },
  { value: 'easy', label: 'Facile', color: '#50c878', bg: 'rgba(80,200,120,0.15)', border: 'rgba(80,200,120,0.3)' },
];

interface Props {
  onComplete: (difficulty: string) => void;
  onBack: () => void;
}

export default function HifzStep6Tour({ onComplete, onBack }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <HifzStepWrapper stepNumber={6} stepTitle="Le Tour (Révision SM-2)" onBack={onBack}>
      <div className="text-center space-y-6">
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
          style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.3)' }}
        >
          <Shield className="h-8 w-8" style={{ color: '#d4af37' }} />
        </div>

        <p className="text-white/80 text-sm leading-relaxed px-2">
          Ta révision quotidienne. Ce qui a été appris il y a plus d'un mois doit être revu pour ne jamais être oublié.
        </p>

        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}
        >
          <p className="text-white/60 text-sm mb-5">
            Évalue la facilité de ta récitation pour ajuster l'espacement des prochaines révisions :
          </p>

          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTY_BUTTONS.map(btn => (
              <motion.button
                key={btn.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelected(btn.value)}
                className="rounded-xl py-4 font-semibold text-sm transition-all"
                style={{
                  background: selected === btn.value ? btn.bg : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${selected === btn.value ? btn.border : 'rgba(255,255,255,0.08)'}`,
                  color: selected === btn.value ? btn.color : 'rgba(255,255,255,0.4)',
                }}
              >
                {btn.label}
              </motion.button>
            ))}
          </div>
        </div>

        {selected && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onComplete(selected)}
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold"
            style={{ background: 'linear-gradient(135deg, #d4af37, #b8962e)', color: '#1a2e1a' }}
          >
            <Check className="h-5 w-5" />
            Valider la session
          </motion.button>
        )}
      </div>
    </HifzStepWrapper>
  );
}
