import { motion } from 'framer-motion';
import { Calendar, Check } from 'lucide-react';
import { SURAHS } from '@/lib/surahData';

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  maintenanceDay: number;
  maintenanceStartDate: string | null;
  onDayComplete: () => void;
}

export default function MouradMaintenance({ surahNumber, startVerse, endVerse, maintenanceDay, maintenanceStartDate, onDayComplete }: Props) {
  const surah = SURAHS.find(s => s.number === surahNumber);
  const totalDays = 30;
  const progress = Math.min(100, (maintenanceDay / totalDays) * 100);
  const remaining = Math.max(0, totalDays - maintenanceDay);

  // Check if today was already done
  const today = new Date().toISOString().split('T')[0];
  const startDate = maintenanceStartDate ? new Date(maintenanceStartDate) : new Date();
  const daysSinceStart = Math.floor((new Date(today).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const todayAlreadyDone = maintenanceDay > daysSinceStart;

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(5,150,105,0.1)', color: '#059669' }}>
          <Calendar className="h-3.5 w-3.5" />
          Maintenance — 30 jours
        </div>
        <h2 className="text-lg font-bold text-gray-800">{surah?.name} · v.{startVerse}-{endVerse}</h2>
        <p className="text-gray-500 text-xs">1 récitation par jour pendant 30 jours</p>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <div className="grid grid-cols-7 gap-1.5 mb-4">
          {Array.from({ length: totalDays }, (_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg flex items-center justify-center text-xs font-medium"
              style={{
                background: i < maintenanceDay ? '#059669' : 'rgba(5,150,105,0.08)',
                color: i < maintenanceDay ? 'white' : '#9CA3AF',
              }}
            >
              {i < maintenanceDay ? <Check className="h-3 w-3" /> : i + 1}
            </div>
          ))}
        </div>

        <div className="w-full h-2 rounded-full" style={{ background: 'rgba(5,150,105,0.1)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: '#059669' }} />
        </div>

        <p className="text-center text-sm text-gray-500 mt-3">
          {remaining > 0 ? (
            <>Jour <strong className="text-gray-800">{maintenanceDay + 1}</strong> sur {totalDays} — encore {remaining} jours</>
          ) : (
            <span style={{ color: '#059669' }} className="font-semibold">✨ Les 30 jours sont terminés !</span>
          )}
        </p>
      </div>

      {/* Today's action */}
      {remaining > 0 && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onDayComplete}
          disabled={todayAlreadyDone}
          className="w-full rounded-2xl py-4 flex items-center justify-center gap-3 font-bold text-white disabled:opacity-50"
          style={{
            background: todayAlreadyDone ? '#9CA3AF' : 'linear-gradient(135deg, #059669, #10B981)',
            boxShadow: todayAlreadyDone ? 'none' : '0 4px 20px rgba(5,150,105,0.3)',
          }}
        >
          <Check className="h-5 w-5" />
          {todayAlreadyDone ? 'Récitation du jour ✓' : 'J\'ai récité aujourd\'hui'}
        </motion.button>
      )}
    </div>
  );
}
