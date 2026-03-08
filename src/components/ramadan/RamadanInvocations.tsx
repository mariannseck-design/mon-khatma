import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

const invocations = [
  {
    title: "Apparition du croissant (Al-hilâl)",
    emoji: '🌙',
    arabic: 'الله أَكْـبَر اللّهُمَّ أَهِلَّـهُ عَلَيْـنا بِالأمْـنِ وَالإيمـان والسَّلامَـةِ والإسْلام، وَالتَّـوْفيـقِ لِما تُحِـبُّ رَبَّنـا وَتَـرْضـى رَبُّنـا وَرَبُّكَ الله',
    phonetic: "Allahu Akbar, Allahumma ahillu 'aleynâ bî-l-amni wâ-l-Îmân, wâ-s-salâmati wâ-l-Islâm wa-t-Tawfîq limâ tuhibbu Rabbana wa tarDa Rabbunâ wa Rabbuka-l-lah.",
    translation: "Allah est le Plus Grand ! Ô Seigneur ! Apporte-nous avec cette nouvelle lune la sécurité et la foi, le salut et l'Islam ainsi que la réussite dans tout ce que Tu aimes et que Tu agrées.",
  },
  {
    title: "Rupture du jeûne (Al-Iftar)",
    emoji: '📅',
    arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الأَجْرُ إِنْ شَاءَ الله',
    phonetic: "Thahabadh-dhama'u wabtallatil-'urooqu, wa thabatal-'ajru 'inshaa'Allaah.",
    translation: "La soif est dissipée, les veines sont abreuvées et la récompense est assurée si Allah le veut.",
  },
  {
    title: "Nuit du Destin (Laylatul-Qadr)",
    emoji: '⭐',
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    phonetic: "Allahumma innaka 'Afuwwun tuhibbu-l-'afwa, fâ'fu 'annî.",
    translation: "Ô Allah (عز وجل), Tu es certes Pardonneur, Tu aimes le pardon, alors pardonne-moi.",
  },
  {
    title: "En route vers la prière de l'Aïd",
    emoji: '🕌',
    arabic: null,
    phonetic: "Allahu akbar, Allahu akbar, lâ ilaha illa Allah, wâ-l-ahu akbar, Allahu akbar wa lillahi-l-hamd.",
    translation: "Allah est grand, Allah est grand, il n'y a de divinité qu'Allah, et Allah est grand, Allah est grand et à Lui sont les louanges.",
  },
  {
    title: "Félicitations de l'Aïd",
    emoji: '❤️',
    arabic: 'تقبل الله منا ومنكم',
    phonetic: "Taqabala-l-lahu minâ wa minkum.",
    translation: "Qu'Allah (عز وجل) agrée nos bonnes actions et les vôtres.",
  },
];

export default function RamadanInvocations() {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg text-foreground flex items-center gap-2">
        🤲 Invocations du Ramadan & de l'Aïd
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

            <p className="text-center text-sm text-foreground/80">
              {inv.translation}
            </p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
