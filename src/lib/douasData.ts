import { type DhikrItem } from '@/components/dhikr/DhikrCounter';

export interface DouaSubtheme {
  id: string;
  title: string;
  icon: string;
  items: DhikrItem[];
}

export interface DouaCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  bg: string;
  textColor: string;
  subthemes: DouaSubtheme[];
}

export const DOUAS_CATEGORIES: DouaCategory[] = [
  {
    id: 'aube',
    title: 'Aube & Crépuscule',
    subtitle: 'Sommeil · Réveil · Nuit',
    icon: 'Moon',
    bg: '#1a1a2e',
    textColor: '#D4AF37',
    subthemes: [
      {
        id: 'reveil',
        title: 'Au réveil',
        icon: '🌅',
        items: [
          {
            title: 'Doua du réveil',
            arabic: 'الحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
            phonetic: 'Al-hamdou lillâhi-lladhî ahyânâ ba\'da mâ amâtanâ wa ilayhi-nnushûr',
            french: 'Louange à Allah (عز وجل) qui nous a redonné la vie après nous avoir fait mourir, et c\'est vers Lui la résurrection.',
            target: 1,
            source: 'Al-Boukhârî',
          },
        ],
      },
      {
        id: 'dormir',
        title: 'Avant de dormir',
        icon: '🌙',
        items: [
          {
            title: 'Doua avant de dormir',
            arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
            phonetic: 'Bismika-llâhoumma amûtou wa ahyâ',
            french: 'C\'est en Ton nom, ô Allah (عز وجل), que je meurs et que je vis.',
            target: 1,
            source: 'Al-Boukhârî',
          },
          {
            title: 'Sourate Al-Ikhlâs, Al-Falaq et An-Nâs',
            arabic: 'يَجْمَعُ كَفَّيْهِ ثُمَّ يَنْفُثُ فِيهِمَا فَيَقْرَأُ فِيهِمَا: قُلْ هُوَ اللَّهُ أَحَدٌ… وَ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ… وَ قُلْ أَعُوذُ بِرَبِّ النَّاسِ…',
            phonetic: 'On réunit ses paumes, on souffle dedans puis on récite les 3 sourates protectrices',
            french: 'Le Prophète (ﷺ) rassemblait ses mains chaque nuit, y soufflait et récitait les trois sourates protectrices, puis passait ses mains sur tout son corps.',
            target: 3,
            source: 'Al-Boukhârî et Mouslim',
          },
          {
            title: 'Doua de remise à Allah',
            arabic: 'اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ',
            phonetic: 'Allâhoumma aslamtou nafsî ilayka, wa fawwadtou amrî ilayka, wa wajjahtou wajhî ilayka, wa alja\'tou dhahrî ilayka, raghbatan wa rahbatan ilayka',
            french: 'Ô Allah (عز وجل), je me suis soumis à Toi, je T\'ai confié mon sort, j\'ai dirigé mon visage vers Toi et je me suis adossé à Toi, par désir et par crainte envers Toi.',
            target: 1,
            source: 'Al-Boukhârî et Mouslim',
          },
        ],
      },
      {
        id: 'insomnie',
        title: 'En cas d\'insomnie',
        icon: '😴',
        items: [
          {
            title: 'Doua de l\'insomnie',
            arabic: 'اللَّهُمَّ غَارَتِ النُّجُومُ وَهَدَأَتِ الْعُيُونُ وَأَنْتَ حَيٌّ قَيُّومٌ، يَا حَيُّ يَا قَيُّومُ أَنِمْ عَيْنِي وَأَهْدِئْ لَيْلِي',
            phonetic: 'Allâhoumma ghârati-nnujoûm, wa hada\'ati-l-\'uyoûn, wa anta hayyoun qayyoûm, yâ hayyou yâ qayyoûm, anim \'aynî wa ahdi\' laylî',
            french: 'Ô Allah (عز وجل), les étoiles se sont couchées, les yeux se sont assoupis et Tu es Le Vivant, Le Subsistant. Ô Vivant, ô Subsistant, endors mes yeux et apaise ma nuit.',
            target: 1,
            source: 'Ibn As-Sounni',
          },
        ],
      },
      {
        id: 'cauchemar',
        title: 'Après un cauchemar',
        icon: '😰',
        items: [
          {
            title: 'Protection après un cauchemar',
            arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ غَضَبِهِ وَعِقَابِهِ وَشَرِّ عِبَادِهِ وَمِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَنْ يَحْضُرُونِ',
            phonetic: 'A\'oûdhou bi-kalimâti-llâhi-ttâmmâti min ghadabihi wa \'iqâbihi wa sharri \'ibâdihi wa min hamazâti-shshayâtîn wa an yahduroûn',
            french: 'Je cherche protection auprès des paroles parfaites d\'Allah (عز وجل) contre Sa colère, Son châtiment, le mal de Ses serviteurs et les suggestions des démons.',
            target: 1,
            source: 'Abou Dâwoud',
          },
        ],
      },
      {
        id: 'priere-nuit',
        title: 'Prière de nuit (Qiyâm)',
        icon: '🤲',
        items: [
          {
            title: 'Doua d\'ouverture du Qiyâm',
            arabic: 'اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ نُورُ السَّمَاوَاتِ وَالأَرْضِ وَمَنْ فِيهِنَّ، وَلَكَ الْحَمْدُ أَنْتَ قَيِّمُ السَّمَاوَاتِ وَالأَرْضِ وَمَنْ فِيهِنَّ',
            phonetic: 'Allâhoumma laka-l-hamd, anta noûrou-ssamâwâti wa-l-ard wa man fîhinn, wa laka-l-hamd anta qayyimou-ssamâwâti wa-l-ard wa man fîhinn',
            french: 'Ô Allah (عز وجل), à Toi la louange ! Tu es la lumière des cieux et de la terre et de ceux qui s\'y trouvent. À Toi la louange, Tu es le Soutien des cieux et de la terre.',
            target: 1,
            source: 'Al-Boukhârî et Mouslim',
          },
        ],
      },
    ],
  },
  {
    id: 'passages',
    title: 'Mes Passages',
    subtitle: 'Mosquée · Voyage · Marché',
    icon: 'MapPin',
    bg: '#faf8f5',
    textColor: '#2d6a4f',
    subthemes: [
      {
        id: 'adhan',
        title: 'Après l\'Adhân',
        icon: '🕌',
        items: [
          {
            title: 'Doua après l\'Adhân',
            arabic: 'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلاةِ الْقَائِمَةِ آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ',
            phonetic: 'Allâhoumma rabba hâdhihi-dda\'wati-ttâmmah, wa-ssalâti-l-qâ\'imah, âti Muhammadan (ﷺ) al-wasîlata wa-l-fadîlah, wab\'ath-hou maqâman mahmûdani-lladhî wa\'adtah',
            french: 'Ô Allah (عز وجل), Seigneur de cet appel parfait et de cette prière imminente, accorde à Mouhamed (ﷺ) la place privilégiée et la vertu, et ressuscite-le au rang digne de louange que Tu lui as promis.',
            target: 1,
            source: 'Al-Boukhârî',
          },
        ],
      },
      {
        id: 'mosquee-entree',
        title: 'Entrée à la mosquée',
        icon: '🚪',
        items: [
          {
            title: 'En entrant à la mosquée',
            arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
            phonetic: 'Allâhoumma-ftah lî abwâba rahmatik',
            french: 'Ô Allah (عز وجل), ouvre-moi les portes de Ta miséricorde.',
            target: 1,
            source: 'Mouslim',
          },
        ],
      },
      {
        id: 'mosquee-sortie',
        title: 'Sortie de la mosquée',
        icon: '🚶',
        items: [
          {
            title: 'En sortant de la mosquée',
            arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
            phonetic: 'Allâhoumma innî as\'alouka min fadlik',
            french: 'Ô Allah (عز وجل), je Te demande de Ta grâce.',
            target: 1,
            source: 'Mouslim',
          },
        ],
      },
      {
        id: 'voyage-depart',
        title: 'Doua du voyage (départ)',
        icon: '✈️',
        items: [
          {
            title: 'Doua du voyage',
            arabic: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
            phonetic: 'Allâhou akbar, Allâhou akbar, Allâhou akbar, soubhâna-lladhî sakhkhara lanâ hâdhâ wa mâ kounnâ lahou mouqrinîn, wa innâ ilâ rabbinâ lamounqaliboûn',
            french: 'Allah (عز وجل) est Le Plus Grand ! Gloire à Celui qui a mis ceci à notre service alors que nous n\'étions pas capables de le dominer, et c\'est vers notre Seigneur que nous retournerons.',
            target: 1,
            source: 'Mouslim',
          },
        ],
      },
      {
        id: 'marche',
        title: 'Entrée au marché',
        icon: '🛒',
        items: [
          {
            title: 'Doua du marché',
            arabic: 'لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ حَيٌّ لاَ يَمُوتُ بِيَدِهِ الْخَيْرُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
            phonetic: 'Lâ ilâha illa-llâhou wahdahou lâ sharîka lah, lahou-l-moulkou wa lahou-l-hamd, youhyî wa youmîtou wa houwa hayyoun lâ yamoûtou biyadihi-l-khayr wa houwa \'alâ koulli shay\'in qadîr',
            french: 'Il n\'y a de divinité qu\'Allah (عز وجل), Seul sans associé. À Lui la royauté, à Lui la louange. Il donne la vie et la mort, Il est Le Vivant qui ne meurt pas. Le bien est dans Sa main et Il est capable de toute chose.',
            target: 1,
            source: 'At-Tirmidhî',
          },
        ],
      },
      {
        id: 'vehicule',
        title: 'Monter en véhicule',
        icon: '🚗',
        items: [
          {
            title: 'En montant en véhicule',
            arabic: 'بِسْمِ اللَّهِ، الْحَمْدُ لِلَّهِ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
            phonetic: 'Bismi-llâh, al-hamdou lillâh, soubhâna-lladhî sakhkhara lanâ hâdhâ wa mâ kounnâ lahou mouqrinîn, wa innâ ilâ rabbinâ lamounqaliboûn',
            french: 'Au nom d\'Allah (عز وجل), louange à Allah (عز وجل). Gloire à Celui qui a mis ceci à notre service alors que nous n\'étions pas capables de le dominer.',
            target: 1,
            source: 'Mouslim',
          },
        ],
      },
    ],
  },
  {
    id: 'quotidien',
    title: 'Actes du Quotidien',
    subtitle: 'Repas · Pluie · Mariage',
    icon: 'Heart',
    bg: '#c8d5c0',
    textColor: '#1b4332',
    subthemes: [
      {
        id: 'avant-repas',
        title: 'Avant le repas',
        icon: '🍽️',
        items: [
          {
            title: 'Avant de manger',
            arabic: 'بِسْمِ اللَّهِ',
            phonetic: 'Bismi-llâh',
            french: 'Au nom d\'Allah (عز وجل).',
            target: 1,
            source: 'Mouslim',
          },
        ],
      },
      {
        id: 'apres-repas',
        title: 'Après le repas',
        icon: '🤲',
        items: [
          {
            title: 'Après avoir mangé',
            arabic: 'الحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلاَ قُوَّةٍ',
            phonetic: 'Al-hamdou lillâhi-lladhî at\'amanî hâdhâ wa razaqanîhi min ghayri hawlin minnî wa lâ qouwwah',
            french: 'Louange à Allah (عز وجل) qui m\'a nourri de ceci et me l\'a accordé sans force ni puissance de ma part.',
            target: 1,
            source: 'Abou Dâwoud et At-Tirmidhî',
          },
        ],
      },
      {
        id: 'pluie',
        title: 'Lorsqu\'il pleut',
        icon: '🌧️',
        items: [
          {
            title: 'Doua sous la pluie',
            arabic: 'اللَّهُمَّ صَيِّبًا نَافِعًا',
            phonetic: 'Allâhoumma sayyiban nâfi\'an',
            french: 'Ô Allah (عز وجل), accorde-nous une pluie bénéfique.',
            target: 1,
            source: 'Al-Boukhârî',
          },
        ],
      },
      {
        id: 'tonnerre',
        title: 'En entendant le tonnerre',
        icon: '⛈️',
        items: [
          {
            title: 'Doua du tonnerre',
            arabic: 'سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلائِكَةُ مِنْ خِيفَتِهِ',
            phonetic: 'Soubhâna-lladhî yousabbih-hou ar-ra\'dou bihamdihi wa-l-malâ\'ikatou min khîfatih',
            french: 'Gloire à Celui dont le tonnerre Le glorifie par Sa louange, ainsi que les anges, par crainte de Lui.',
            target: 1,
            source: 'Al-Mouwattâ\' de l\'Imam Mâlik',
          },
        ],
      },
      {
        id: 'mariage',
        title: 'Félicitations de mariage',
        icon: '💍',
        items: [
          {
            title: 'Doua pour les mariés',
            arabic: 'بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
            phonetic: 'Bâraka-llâhou laka, wa bâraka \'alayka, wa jama\'a baynakoumâ fî khayr',
            french: 'Qu\'Allah (عز وجل) te bénisse, répande Ses bénédictions sur toi et vous réunisse dans le bien.',
            target: 1,
            source: 'Abou Dâwoud et At-Tirmidhî',
          },
        ],
      },
      {
        id: 'nouveau-ne',
        title: 'Nouveau-né',
        icon: '👶',
        items: [
          {
            title: 'Doua pour le nouveau-né',
            arabic: 'بَارَكَ اللَّهُ لَكَ فِي الْمَوْهُوبِ لَكَ وَشَكَرْتَ الْوَاهِبَ وَبَلَغَ أَشُدَّهُ وَرُزِقْتَ بِرَّهُ',
            phonetic: 'Bâraka-llâhou laka fî-l-mawhûbi lak, wa shakarta-l-wâhib, wa balagha ashoud-dahou, wa rouziqta birrah',
            french: 'Qu\'Allah (عز وجل) te bénisse dans ce qui t\'a été offert, que tu remercies Le Donateur, qu\'il atteigne sa pleine maturité et que tu sois gratifié de sa piété filiale.',
            target: 1,
            source: 'An-Nawawî',
          },
        ],
      },
      {
        id: 'vetement-neuf',
        title: 'Vêtement neuf',
        icon: '👗',
        items: [
          {
            title: 'En portant un vêtement neuf',
            arabic: 'اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ، أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ',
            phonetic: 'Allâhoumma laka-l-hamdou anta kasawtanîh, as\'alouka min khayrihi wa khayri mâ souni\'a lah, wa a\'oûdhou bika min sharrihi wa sharri mâ souni\'a lah',
            french: 'Ô Allah (عز وجل), à Toi la louange, c\'est Toi qui m\'en as revêtu. Je Te demande son bien et le bien pour lequel il a été fait, et je me réfugie auprès de Toi contre son mal et le mal pour lequel il a été fait.',
            target: 1,
            source: 'Abou Dâwoud et At-Tirmidhî',
          },
        ],
      },
      {
        id: 'miroir',
        title: 'En se regardant dans le miroir',
        icon: '🪞',
        items: [
          {
            title: 'Doua du miroir',
            arabic: 'اللَّهُمَّ أَنْتَ حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي',
            phonetic: 'Allâhoumma anta hassanta khalqî fa-hassin khoulouqî',
            french: 'Ô Allah (عز وجل), Tu as embelli ma création, embellis donc mon caractère.',
            target: 1,
            source: 'Ahmad',
          },
        ],
      },
    ],
  },
  {
    id: 'reconfort',
    title: 'Réconfort & Lumière',
    subtitle: 'Épreuves · Dettes · Deuil',
    icon: 'Sparkles',
    bg: '#065F46',
    textColor: '#D4AF37',
    subthemes: [
      {
        id: 'dettes',
        title: 'Soulagement des dettes',
        icon: '💰',
        items: [
          {
            title: 'Doua contre les dettes',
            arabic: 'اللَّهُمَّ اكْفِنِي بِحَلالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ',
            phonetic: 'Allâhoumma-kfinî bi-halâlika \'an harâmik, wa aghninî bi-fadlika \'amman siwâk',
            french: 'Ô Allah (عز وجل), accorde-moi suffisance par Ton licite plutôt que Ton illicite, et enrichis-moi par Ta grâce de sorte que je n\'aie besoin de personne d\'autre que Toi.',
            target: 3,
            source: 'At-Tirmidhî',
          },
        ],
      },
      {
        id: 'affliction',
        title: 'Affliction et tristesse',
        icon: '😢',
        items: [
          {
            title: 'Doua de la détresse',
            arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحُزْنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ',
            phonetic: 'Allâhoumma innî a\'oûdhou bika mina-l-hammi wa-l-houzn, wa-l-\'ajzi wa-l-kasal, wa-l-boukhli wa-l-joubn, wa dala\'i-ddayni wa ghalabati-rrijâl',
            french: 'Ô Allah (عز وجل), je cherche refuge auprès de Toi contre le souci et la tristesse, l\'incapacité et la paresse, l\'avarice et la lâcheté, le fardeau des dettes et la domination des hommes.',
            target: 3,
            source: 'Al-Boukhârî',
          },
          {
            title: 'Doua de Younous (عليه السلام)',
            arabic: 'لاَ إِلَهَ إِلاَّ أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
            phonetic: 'Lâ ilâha illâ anta soubhânaka innî kountou mina-ddhâlimîn',
            french: 'Il n\'y a de divinité que Toi, Gloire à Toi ! J\'ai été certes du nombre des injustes. Invocation de Younous (عليه السلام) dans le ventre de la baleine.',
            target: 7,
            source: 'At-Tirmidhî — Doua de Younous (عليه السلام)',
          },
        ],
      },
      {
        id: 'deces',
        title: 'Décès et condoléances',
        icon: '🕊️',
        items: [
          {
            title: 'En apprenant un décès',
            arabic: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا',
            phonetic: 'Innâ lillâhi wa innâ ilayhi râji\'oûn, Allâhoumma-journi fî mousîbatî wa akhlif lî khayran minhâ',
            french: 'Certes nous appartenons à Allah (عز وجل) et c\'est vers Lui que nous retournerons. Ô Allah (عز وجل), accorde-moi une récompense dans mon épreuve et remplace-la par quelque chose de meilleur.',
            target: 1,
            source: 'Mouslim',
          },
        ],
      },
      {
        id: 'visite-malade',
        title: 'Visite du malade',
        icon: '🏥',
        items: [
          {
            title: 'Doua pour le malade',
            arabic: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ',
            phonetic: 'As\'alou-llâha-l-\'adhîma rabba-l-\'arshi-l-\'adhîmi an yashfiyak',
            french: 'Je demande à Allah (عز وجل), Le Très Grand, Seigneur du Trône immense, de te guérir.',
            target: 7,
            source: 'Abou Dâwoud et At-Tirmidhî',
          },
        ],
      },
      {
        id: 'peur',
        title: 'En cas de peur',
        icon: '😨',
        items: [
          {
            title: 'Doua de la peur',
            arabic: 'لاَ إِلَهَ إِلاَّ اللَّهُ',
            phonetic: 'Lâ ilâha illa-llâh',
            french: 'Il n\'y a de divinité qu\'Allah (عز وجل).',
            target: 3,
            source: 'Al-Boukhârî et Mouslim',
          },
          {
            title: 'Refuge contre le mal',
            arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
            phonetic: 'A\'oûdhou bi-kalimâti-llâhi-ttâmmâti min sharri mâ khalaq',
            french: 'Je cherche refuge auprès des paroles parfaites d\'Allah (عز وجل) contre le mal de ce qu\'Il a créé.',
            target: 3,
            source: 'Mouslim',
          },
        ],
      },
      {
        id: 'difficulte',
        title: 'Face à une difficulté',
        icon: '🤲',
        items: [
          {
            title: 'Doua de la difficulté',
            arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
            phonetic: 'Hasbounâ-llâhou wa ni\'ma-l-wakîl',
            french: 'Allah (عز وجل) nous suffit et Il est Le Meilleur Garant.',
            target: 7,
            source: 'Al-Boukhârî — Parole d\'Ibrâhîm (عليه السلام)',
          },
          {
            title: 'Invocation de la détresse',
            arabic: 'اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ وَأَصْلِحْ لِي شَأْنِي كُلَّهُ لاَ إِلَهَ إِلاَّ أَنْتَ',
            phonetic: 'Allâhoumma rahmataka arjou falâ takilnî ilâ nafsî tarfata \'ayn, wa aslih lî sha\'nî koullah, lâ ilâha illâ ant',
            french: 'Ô Allah (عز وجل), c\'est Ta miséricorde que j\'espère, ne me laisse pas à moi-même un clin d\'œil, et arrange pour moi toute mon affaire. Il n\'y a de divinité que Toi.',
            target: 3,
            source: 'Abou Dâwoud',
          },
        ],
      },
    ],
  },
];
