/**
 * Messages quotidiens pour les notifications à 08:00
 * Règle: Toujours inclure (عز وجل) après "Allah"
 */

export interface DailyMessage {
  day: number; // 0 = Dimanche, 1 = Lundi, etc.
  dayName: string;
  message: string;
}

export const dailyMessages: DailyMessage[] = [
  {
    day: 0, // Dimanche
    dayName: 'Dimanche',
    message: "Bilan et paix. Préparez votre cœur pour demain."
  },
  {
    day: 1, // Lundi
    dayName: 'Lundi',
    message: "Une nouvelle semaine avec la grâce d'Allah (عز وجل). On ouvre le Planificateur ?"
  },
  {
    day: 2, // Mardi
    dayName: 'Mardi',
    message: "La constance est le secret des cœurs apaisés. Continuez !"
  },
  {
    day: 3, // Mercredi
    dayName: 'Mercredi',
    message: "Pause de lumière : votre Coran vous attend."
  },
  {
    day: 4, // Jeudi
    dayName: 'Jeudi',
    message: "Un pas de plus vers Allah (عز وجل). Belle lecture, chère sœur."
  },
  {
    day: 5, // Vendredi
    dayName: 'Vendredi',
    message: "Moubarak ! N'oubliez pas la Sourate Al-Kahf."
  },
  {
    day: 6, // Samedi
    dayName: 'Samedi',
    message: "Savourer chaque verset dans le calme du week-end."
  }
];

export function getTodayMessage(): DailyMessage {
  const today = new Date().getDay();
  return dailyMessages.find(m => m.day === today) || dailyMessages[0];
}

export function getDayMessage(day: number): DailyMessage {
  return dailyMessages.find(m => m.day === day) || dailyMessages[0];
}
