export interface DailyQuote {
  theme: string;
  text: string;
  type: 'citation' | 'doua';
}

export const dailyQuotes: DailyQuote[] = [
  // 🌿 Constance (L'Istiqamah)
  { theme: '🌿', type: 'citation', text: "La régularité est la clé qui ouvre les portes de la mémoire." },
  { theme: '🌿', type: 'citation', text: "Un petit pas chaque jour avec Allah (عز وجل) vaut mieux qu'un grand bond sans lendemain." },
  { theme: '🌿', type: 'citation', text: "L'Istiqamah transforme l'effort en habitude, et l'habitude en succès." },
  { theme: '🌿', type: 'citation', text: "C'est dans la goutte d'eau quotidienne que la pierre finit par se creuser." },
  { theme: '🌿', type: 'citation', text: "Ta constance aujourd'hui est le socle de ta réussite de demain." },

  // 📖 Répétition (La Muraja'a)
  { theme: '📖', type: 'citation', text: "La répétition n'est pas une corvée, c'est le parfum qui imprègne le cœur." },
  { theme: '📖', type: 'citation', text: "Relire, c'est redécouvrir. Répéter, ce n'est pas reculer, c'est s'ancrer." },
  { theme: '📖', type: 'citation', text: "Un verset répété cent fois est un ami qui ne te quittera jamais." },
  { theme: '📖', type: 'citation', text: "La force de ta mémorisation réside dans le nombre de tes répétitions." },
  { theme: '📖', type: 'citation', text: "Chaque révision est une preuve d'amour envers la Parole d'Allah (عز وجل)." },

  // ✨ Ascension (Les Escaliers)
  { theme: '✨', type: 'citation', text: "Chaque verset maîtrisé est une marche de plus vers les sommets." },
  { theme: '✨', type: 'citation', text: "« Récite et monte » : ton ascension commence ici et maintenant." },
  { theme: '✨', type: 'citation', text: "Ne regarde pas la hauteur de l'escalier, concentre-toi sur la marche actuelle." },
  { theme: '✨', type: 'citation', text: "Plus l'ancrage est profond, plus l'ascension est sereine." },
  { theme: '✨', type: 'citation', text: "Ton héritage éternel se construit une marche après l'autre." },

  // 💎 Patience et Intention
  { theme: '💎', type: 'citation', text: "Patiente avec ta mémoire comme les Prophètes (عليهم السلام) ont patienté avec leur peuple." },
  { theme: '💎', type: 'citation', text: "Le Coran ne se donne qu'à celui qui lui donne tout son temps." },
  { theme: '💎', type: 'citation', text: "Ne cours pas après la fin de la Sourate, savoure la présence de chaque mot." },
  { theme: '💎', type: 'citation', text: "Si ton esprit oublie, ton cœur, lui, s'illumine à chaque essai." },
  { theme: '💎', type: 'citation', text: "La mémorisation est un voyage, pas une course. Profite de chaque étape." },

  // 🤲 Invocations (Douas)
  { theme: '🤲', type: 'doua', text: "Ô Allah (عز وجل), fais du Coran le printemps de mon cœur et la lumière de ma poitrine." },
  { theme: '🤲', type: 'doua', text: "Seigneur, augmente mes connaissances et facilite mon chemin vers Ta Parole." },
  { theme: '🤲', type: 'doua', text: "Ô Allah (عز وجل), aide-moi à T'évoquer, à Te remercier et à T'adorer avec excellence." },
  { theme: '🤲', type: 'doua', text: "Seigneur, ouvre-moi ma poitrine et facilite ma tâche." },
  { theme: '🤲', type: 'doua', text: "Ô Allah (عز وجل), je Te demande une science utile et un cœur humble." },
  { theme: '🤲', type: 'doua', text: "Seigneur, affermis ma mémoire et purifie mon intention dans chaque verset." },
  { theme: '🤲', type: 'doua', text: "Ô Allah (عز وجل), enseigne-moi ce que j'ignore et rappelle-moi ce que j'ai oublié." },
  { theme: '🤲', type: 'doua', text: "Seigneur, fais que je sois parmi les gens du Coran, ceux qui sont Tes proches et Tes élus." },
  { theme: '🤲', type: 'doua', text: "Ô Allah (عز وجل), facilite-moi l'ascension de Tes escaliers par la récitation de Tes versets." },
  { theme: '🤲', type: 'doua', text: "Seigneur, accorde-moi la constance des Prophètes (عليه السلام) dans la préservation de Ton Message." },
];

export function getTodayQuote(): DailyQuote {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return dailyQuotes[dayOfYear % dailyQuotes.length];
}
