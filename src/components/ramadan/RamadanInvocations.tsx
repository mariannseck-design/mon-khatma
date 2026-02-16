import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

const invocations = [
  {
    title: 'En voyant le croissant (Hilal)',
    emoji: '🌙',
    arabic: 'اللَّهُ أَكْبَرُ اللّهُمَّ أَهِلَّهُ عَلَيْنَا بِالأَمْنِ وَالإِيمَانِ وَالسَّلامَةِ وَالإِسْلامِ، وَالتَّوْفِيقِ لِمَا تُحِبُّ رَبَّنَا وَتَرْضَى رَبُّنَا وَرَبُّكَ اللَّه',
    phonetic: null,
  },
  {
    title: 'À la rupture du jeûne (Iftar)',
    emoji: '🍽️',
    arabic: null,
    phonetic: "Thahaba th-thama'u, wabtallati l-'uruqu, wa thabata l-ajru in sha' Allah.",
  },
  {
    title: 'Nuit du Destin (Laylatul Qadr)',
    emoji: '✨',
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    phonetic: null,
  },
];

export default function RamadanInvocations() {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg text-foreground flex items-center gap-2">
        🤲 Invocations du Ramadan
      </h2>

      {invocations.map((inv, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="pastel-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{inv.emoji}</span>
              <h3 className="font-display text-base font-semibold text-foreground">{inv.title}</h3>
            </div>

            {inv.arabic && (
              <p className="arabic-text text-center text-xl leading-loose font-bold" style={{ fontSize: 'var(--arabic-font-size, 110%)' }}>
                {inv.arabic}
              </p>
            )}

            {inv.phonetic && (
              <p className="text-center text-sm text-muted-foreground italic">
                {inv.phonetic}
              </p>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
