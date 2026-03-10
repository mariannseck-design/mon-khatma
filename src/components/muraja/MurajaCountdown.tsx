import { motion } from 'framer-motion';
import { CheckCircle, Clock, CalendarDays, Link, BookOpen } from 'lucide-react';

interface NextReview {
  surahName: string;
  verseStart: number;
  verseEnd: number;
  page?: string;
  date: string;
  type: 'rabt' | 'tour';
}

interface MurajaCountdownProps {
  allChecked?: boolean;
  nextReviews?: NextReview[];
}

export default function MurajaCountdown({ allChecked = false, nextReviews = [] }: MurajaCountdownProps) {
  if (!allChecked) {
    return (
      <div
        className="rounded-2xl p-5 text-center"
        style={{
          background: 'var(--p-card)',
          border: '1px solid var(--p-border)',
          boxShadow: 'var(--p-card-shadow)',
        }}
      >
        <Clock className="h-6 w-6 mx-auto mb-2" style={{ color: 'var(--p-text-60)' }} />
        <p className="text-sm font-bold" style={{ color: 'var(--p-text-75)' }}>
          En attente de ta validation du jour
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--p-text-50)' }}>
          Récite et valide tes blocs ci-dessous
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 text-center space-y-3"
      style={{
        background: 'var(--p-card)',
        border: '1px solid var(--p-border)',
        boxShadow: 'var(--p-card-shadow)',
      }}
    >
      <div className="flex items-center justify-center gap-2">
        <CheckCircle className="h-5 w-5" style={{ color: '#10B981' }} />
        <p className="text-sm font-bold" style={{ color: '#10B981' }}>
          Révisions du jour terminées ✓
        </p>
      </div>

      {nextReviews.length > 0 && (
        <div className="space-y-2 pt-3" style={{ borderTop: '1px solid var(--p-border)' }}>
          <p className="text-xs font-bold" style={{ color: 'var(--p-text-75)' }}>
            Prochaines révisions :
          </p>
          {nextReviews.map((nr, i) => {
            const isRabt = nr.type === 'rabt';
            const accentColor = isRabt ? '#D4AF37' : '#10B981';
            const bgColor = isRabt ? 'rgba(212, 175, 55, 0.08)' : 'rgba(16, 185, 129, 0.08)';
            const borderColor = isRabt ? 'rgba(212, 175, 55, 0.25)' : 'rgba(16, 185, 129, 0.25)';
            const IconComp = isRabt ? Link : BookOpen;
            const typeLabel = isRabt ? 'Liaison' : 'Révision';

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-left"
                style={{
                  background: bgColor,
                  border: `1px solid ${borderColor}`,
                }}
              >
                {/* Icon badge */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isRabt
                      ? 'linear-gradient(135deg, #B8960C, #D4AF37)'
                      : 'linear-gradient(135deg, #065F46, #10B981)',
                    boxShadow: `0 2px 8px -2px ${accentColor}66`,
                  }}
                >
                  <IconComp className="h-3.5 w-3.5 text-white" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold truncate" style={{ color: 'var(--p-primary)' }}>
                      {nr.surahName}
                    </span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: `${accentColor}20`, color: accentColor }}
                    >
                      {typeLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-semibold" style={{ color: 'var(--p-text-60)' }}>
                      v. {nr.verseStart} → {nr.verseEnd}
                    </span>
                    {nr.page && (
                      <span
                        className="font-medium px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--p-track)', color: 'var(--p-text-50)', fontSize: '10px' }}
                      >
                        {nr.page}
                      </span>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1 flex-shrink-0" style={{ color: accentColor }}>
                  <CalendarDays className="h-3 w-3" />
                  <span className="font-bold text-[11px]">{nr.date}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
