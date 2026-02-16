import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface Dua {
  arabic: string;
  phonetic: string;
  french: string;
}

const difficultDuas: Dua[] = [
  {
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الهَمِّ وَ الْحَـزَنِ، والعَجْـزِ والكَسَلِ، والبُخْلِ والجُبْنِ، وضَلَعِ الدَّيْنِ وغَلَبَةِ الرِّجَالِ',
    phonetic: "Allâhoumma innî a'oûdhou bika mina-l-hammi wa-l-hazani, wa-l-'ajzi wa-l-kasali, wa-l-boukhli wa-l-joubni, wa dala'i d-dayni wa ghalabati r-rijâl.",
    french: "Ô Allah (عز وجل), je me mets sous Ta protection contre les soucis et la tristesse, contre l'incapacité et la paresse, contre l'avarice et la lâcheté, contre le poids de la dette et la domination des hommes.",
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي عَبْدُكَ ابْنُ عَبْدِكَ ابْنُ أَمَتِكَ نَاصِيَتِي بِيَدِكَ... أنْ تَجْعَلَ القُرْآنَ رَبِيعَ قَلْبِي',
    phonetic: "Allâhumma innî 'abduka bnu 'abdika bnu amatik... an taj'ala-l-qurâna rabî'a qalbî.",
    french: "Ô Allah (عز وجل) ! Je suis Ton serviteur... fais en sorte que le Coran soit le printemps de mon cœur, la lumière de ma poitrine, qu'il dissipe ma tristesse et mette fin à mes soucis.",
  },
  {
    arabic: 'اللهم لا سهل إلا ما جعلته سهلا وأنت تجعل الحزن إذا شئت سهلا',
    phonetic: "Allâhoumma La Sahla illa ma ja'altahu sahlan wa anta taj'all al hazan idha chitta sahlan.",
    french: "Ô Allah (عز وجل), rien n'est facile, sauf ce que Tu as rendu facile, et Tu es Celui qui, selon Ton vouloir, rend facile le chagrin.",
  },
];

const HADITH_DIFFICILE = "Tout ce qui touche le croyant comme fatigue, comme maladie, comme soucis, comme tristesse, comme gêne, comme angoisse, même une épine qui le pique est une expiation d'Allah (عز وجل) de ses péchés.";

interface MoodDuaCardProps {
  moodValue: number;
}

export function MoodDuaCard({ moodValue }: MoodDuaCardProps) {
  // "Difficile" = 1, "Fatiguée" = 2, "Sereine" = 5, "Bien" = 4
  const isDifficult = moodValue === 1 || moodValue === 2;
  const isPositive = moodValue === 4 || moodValue === 5;

  if (!isDifficult && !isPositive) return null;

  if (isPositive) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="pastel-card p-5 bg-gradient-to-r from-primary/10 to-accent/10">
          <p className="arabic-text text-center text-xl font-bold mb-3 leading-loose" style={{ fontSize: 'calc(var(--arabic-font-size, 100%) * 1.2)' }}>
            الحمد لله على كل حال
          </p>
          <p className="text-center text-sm text-foreground italic">
            Alhamdu lillaahi 'alaa kulli haall
          </p>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Louanges à Allah <span className="honorific font-bold" style={{ fontSize: '1.1em' }}>(عز وجل)</span> en toute situation.
          </p>
        </Card>
      </motion.div>
    );
  }

  // Pick a random dua for difficult moods
  const randomDua = difficultDuas[Math.floor(Math.random() * difficultDuas.length)];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="pastel-card p-5 bg-gradient-to-r from-accent/10 to-secondary/10">
        <p className="arabic-text text-center text-xl font-bold mb-3 leading-loose" style={{ fontSize: 'calc(var(--arabic-font-size, 100%) * 1.2)' }}>
          {randomDua.arabic}
        </p>
        <p className="text-center text-sm text-foreground italic mb-2">
          {randomDua.phonetic}
        </p>
        <p className="text-center text-sm text-muted-foreground">
          {randomDua.french}
        </p>
      </Card>

      <Card className="pastel-card p-4 bg-gradient-to-r from-primary/5 to-accent/5">
        <p className="text-sm text-foreground italic text-center leading-relaxed">
          "{HADITH_DIFFICILE}"
        </p>
        <p className="text-xs text-muted-foreground text-center mt-2">
          — Boukhari 5641
        </p>
      </Card>
    </motion.div>
  );
}
