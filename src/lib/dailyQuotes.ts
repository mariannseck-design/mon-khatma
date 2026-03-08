export interface DailyQuote {
  theme: string;
  text: string;
}

export const dailyQuotes: DailyQuote[] = [
  // 🌿 Constance (L'Istiqamah)
  { theme: '🌿', text: "La régularité est la clé qui ouvre les portes de la mémoire." },
  { theme: '🌿', text: "Un petit pas chaque jour avec Allah (عز وجل) vaut mieux qu'un grand bond sans lendemain." },
  { theme: '🌿', text: "L'Istiqamah transforme l'effort en habitude, et l'habitude en succès." },
  { theme: '🌿', text: "C'est dans la goutte d'eau quotidienne que la pierre finit par se creuser." },
  { theme: '🌿', text: "Ta constance aujourd'hui est le socle de ta réussite de demain." },

  // 📖 Répétition (La Muraja'a)
  { theme: '📖', text: "La répétition n'est pas une corvée, c'est le parfum qui imprègne le cœur." },
  { theme: '📖', text: "Relire, c'est redécouvrir. Répéter, ce n'est pas reculer, c'est s'ancrer." },
  { theme: '📖', text: "Un verset répété cent fois est un ami qui ne te quittera jamais." },
  { theme: '📖', text: "La force de ta mémorisation réside dans le nombre de tes répétitions." },
  { theme: '📖', text: "Chaque révision est une preuve d'amour envers la Parole d'Allah (عز وجل)." },

  // ✨ Ascension (Les Escaliers)
  { theme: '✨', text: "Chaque verset maîtrisé est une marche de plus vers les sommets." },
  { theme: '✨', text: "« Récite et monte » : ton ascension commence ici et maintenant." },
  { theme: '✨', text: "Ne regarde pas la hauteur de l'escalier, concentre-toi sur la marche actuelle." },
  { theme: '✨', text: "Plus l'ancrage est profond, plus l'ascension est sereine." },
  { theme: '✨', text: "Ton héritage éternel se construit une marche après l'autre." },

  // 💎 Patience et Intention
  { theme: '💎', text: "Patiente avec ta mémoire comme les Prophètes (عليهم السلام) ont patienté avec leur peuple." },
  { theme: '💎', text: "Le Coran ne se donne qu'à celui qui lui donne tout son temps." },
  { theme: '💎', text: "Ne cours pas après la fin de la Sourate, savoure la présence de chaque mot." },
  { theme: '💎', text: "Si ton esprit oublie, ton cœur, lui, s'illumine à chaque essai." },
  { theme: '💎', text: "La mémorisation est un voyage, pas une course. Profite de chaque étape." },
];

export function getTodayQuote(): DailyQuote {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return dailyQuotes[dayOfYear % dailyQuotes.length];
}
