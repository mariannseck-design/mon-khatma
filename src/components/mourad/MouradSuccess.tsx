import { motion } from 'framer-motion';
import { Star, ArrowRight, RotateCcw } from 'lucide-react';
import { SURAHS } from '@/lib/surahData';

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  onNewCycle: () => void;
  onGoToMuraja: () => void;
}

export default function MouradSuccess({ surahNumber, startVerse, endVerse, onNewCycle, onGoToMuraja }: Props) {
  const surah = SURAHS.find(s => s.number === surahNumber);

  return (
    <div className="space-y-6 text-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <Star className="h-16 w-16 mx-auto" style={{ color: '#059669' }} fill="#059669" />
      </motion.div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">
          Macha Allah ! 🎉
        </h1>
        <p className="text-gray-600">
          Tu as terminé le cycle complet pour
        </p>
        <p className="text-lg font-semibold" style={{ color: '#059669' }}>
          {surah?.name} — versets {startVerse} à {endVerse}
        </p>
        <p className="text-gray-500 text-sm">
          Ces versets ont été transférés dans ton module de révision espacée (Muraja'a).
        </p>
      </div>

      <div className="space-y-3 pt-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNewCycle}
          className="w-full rounded-2xl py-4 flex items-center justify-center gap-3 font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #059669, #10B981)',
            boxShadow: '0 4px 20px rgba(5,150,105,0.3)',
          }}
        >
          <RotateCcw className="h-5 w-5" />
          Nouveau cycle
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onGoToMuraja}
          className="w-full rounded-2xl py-4 flex items-center justify-center gap-3 font-semibold border-2 text-gray-700"
          style={{ borderColor: '#059669', color: '#059669' }}
        >
          <ArrowRight className="h-5 w-5" />
          Aller à Muraja'a
        </motion.button>
      </div>
    </div>
  );
}
