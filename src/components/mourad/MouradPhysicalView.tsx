import { SURAHS } from '@/lib/surahData';
import { BookOpen } from 'lucide-react';

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
}

export default function MouradPhysicalView({ surahNumber, startVerse, endVerse }: Props) {
  const surah = SURAHS.find(s => s.number === surahNumber);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center space-y-4">
      <BookOpen className="h-10 w-10 mx-auto" style={{ color: '#059669' }} />
      <div>
        <h3 className="text-lg font-bold text-gray-800">
          {surah?.name || `Sourate ${surahNumber}`}
        </h3>
        {surah?.nameFr && (
          <p className="text-sm text-gray-500">{surah.nameFr}</p>
        )}
      </div>
      <div
        className="rounded-2xl py-4 px-6 mx-auto"
        style={{ background: 'rgba(5,150,105,0.08)', maxWidth: '220px' }}
      >
        <p className="text-sm text-gray-500 mb-1">Versets à lire</p>
        <p className="text-2xl font-bold" style={{ color: '#059669' }}>
          {startVerse} — {endVerse}
        </p>
      </div>
      <p className="text-xs text-gray-400 italic">
        Ouvre ton Mushaf physique et lis les versets indiqués
      </p>
    </div>
  );
}
