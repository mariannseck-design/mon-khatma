import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flower2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SUCCESS_MESSAGES = [
  {
    title: 'Alhamdulillah ! Objectif atteint. 🌟',
    text: ['Vous venez de sceller ces versets dans votre cœur par la répétition. Qu\'Allah ', '(عز وجل)', ' accepte vos efforts, illumine votre poitrine par Son Livre et vous facilite la suite.'],
  },
  {
    title: 'Masha\'Allah, un grand pas en avant !',
    text: ['Vos 40 répétitions sont terminées. Qu\'Allah ', '(عز وجل)', ' ancre fermement ces paroles dans votre mémoire. Il est temps de planifier vos révisions quotidiennes.'],
  },
  {
    title: 'Phase de Tikrâr terminée !',
    text: ['Félicitations pour votre constance. La mémorisation initiale est validée. Qu\'Allah ', '(عز وجل)', ' bénisse votre temps. Passons à la phase d\'ancrage.'],
  },
];

const STEP_LABELS: Record<number, string> = {
  0: 'Intention',
  1: 'Révision',
  2: 'Imprégnation',
  3: 'Istiqâmah',
  4: 'Validation',
  5: 'Tikrar',
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}min ${s}s` : `${m}min`;
}

interface Props {
  stepTimes?: Record<string, number | boolean | string>;
}

export default function HifzSuccess({ stepTimes }: Props) {
  const navigate = useNavigate();
  const [message] = useState(() => SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)]);

  const times: { step: number; label: string; seconds: number }[] = [];
  let totalSeconds = 0;

  if (stepTimes) {
    for (let i = 0; i <= 4; i++) {
      const key = `step_${i}_time`;
      const val = stepTimes[key];
      if (typeof val === 'number' && val > 0) {
        times.push({ step: i, label: STEP_LABELS[i] || `Étape ${i}`, seconds: val });
        totalSeconds += val;
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6 py-8"
    >
      {/* Animated rays */}
      <div className="relative w-32 h-32 mx-auto">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-1 h-12 origin-bottom"
            style={{
              background: 'linear-gradient(to top, transparent, #d4af37)',
              transform: `translate(-50%, -100%) rotate(${i * 45}deg)`,
              borderRadius: '2px',
            }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: [0, 1, 0.5], scaleY: [0, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
        <div
          className="absolute inset-4 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(212,175,55,0.2)', border: '2px solid rgba(212,175,55,0.5)' }}
        >
          <Flower2 className="h-10 w-10" style={{ color: '#d4af37' }} />
        </div>
      </div>

      <h1
        className="text-2xl font-bold tracking-[0.15em] uppercase"
        style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}
      >
        {message.title}
      </h1>

      <p className="text-white/80 text-sm leading-relaxed px-4">
        {message.text[0]}
        <span style={{ fontFamily: "'Amiri', serif", fontWeight: 'bold', fontSize: '1.1em' }}>{message.text[1]}</span>
        {message.text[2]}
      </p>

      {/* Time recap */}
      {times.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl px-4 py-4 mx-auto max-w-xs space-y-3"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}
        >
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" style={{ color: '#d4af37' }} />
            <span className="text-sm font-semibold" style={{ color: '#d4af37' }}>
              Temps total : {formatDuration(totalSeconds)}
            </span>
          </div>

          <div className="space-y-1.5">
            {times.map(({ step, label, seconds }) => {
              const pct = totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0;
              return (
                <div key={step} className="flex items-center gap-2 text-xs">
                  <span className="w-24 text-right truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {label}
                  </span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #d4af37, #f0d060)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.5 + step * 0.08 }}
                    />
                  </div>
                  <span className="w-14 text-left tabular-nums" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {formatDuration(seconds)}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Single CTA */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/muraja/rabt')}
        className="mx-auto px-8 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-base w-full max-w-xs"
        style={{
          background: 'linear-gradient(135deg, #d4af37, #b8962e)',
          color: '#1a2e1a',
          boxShadow: '0 6px 20px rgba(212,175,55,0.4)',
        }}
      >
        Transférer vers la consolidation (Ar-Rabt)
      </motion.button>

    </motion.div>
  );
}