import { motion } from 'framer-motion';
import { CheckCircle, Clock, CalendarDays } from 'lucide-react';

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
        <div className="space-y-1.5 pt-2" style={{ borderTop: '1px solid var(--p-border)' }}>
          <p className="text-xs font-bold" style={{ color: 'var(--p-text-75)' }}>
            Prochaines révisions :
          </p>
          {nextReviews.map((nr, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs"
              style={{
                background: nr.type === 'rabt' ? 'rgba(212, 175, 55, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                border: `1px solid ${nr.type === 'rabt' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="font-bold" style={{ color: 'var(--p-primary)' }}>
                  {nr.surahName}
                </span>
                <span className="font-semibold" style={{ color: 'var(--p-text-60)' }}>
                  v. {nr.verseStart} → {nr.verseEnd}
                </span>
                {nr.page && (
                  <span className="font-medium px-1 py-0.5 rounded" style={{ background: 'var(--p-card)', color: 'var(--p-text-50)' }}>
                    {nr.page}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0" style={{ color: 'var(--p-accent)' }}>
                <CalendarDays className="h-3 w-3" />
                <span className="font-semibold">{nr.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
