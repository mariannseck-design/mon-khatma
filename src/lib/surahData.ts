// Complete list of 114 Surahs with their names, Arabic names, verse counts, and approximate page positions
export interface Surah {
  number: number;
  name: string;
  arabicName: string;
  versesCount: number;
  startPage: number;
}

export const SURAHS: Surah[] = [
  { number: 1, name: "Al-Fatiha", arabicName: "الفاتحة", versesCount: 7, startPage: 1 },
  { number: 2, name: "Al-Baqara", arabicName: "البقرة", versesCount: 286, startPage: 2 },
  { number: 3, name: "Ali 'Imran", arabicName: "آل عمران", versesCount: 200, startPage: 50 },
  { number: 4, name: "An-Nisa", arabicName: "النساء", versesCount: 176, startPage: 77 },
  { number: 5, name: "Al-Ma'ida", arabicName: "المائدة", versesCount: 120, startPage: 106 },
  { number: 6, name: "Al-An'am", arabicName: "الأنعام", versesCount: 165, startPage: 128 },
  { number: 7, name: "Al-A'raf", arabicName: "الأعراف", versesCount: 206, startPage: 151 },
  { number: 8, name: "Al-Anfal", arabicName: "الأنفال", versesCount: 75, startPage: 177 },
  { number: 9, name: "At-Tawba", arabicName: "التوبة", versesCount: 129, startPage: 187 },
  { number: 10, name: "Yunus", arabicName: "يونس", versesCount: 109, startPage: 208 },
  { number: 11, name: "Hud", arabicName: "هود", versesCount: 123, startPage: 221 },
  { number: 12, name: "Yusuf", arabicName: "يوسف", versesCount: 111, startPage: 235 },
  { number: 13, name: "Ar-Ra'd", arabicName: "الرعد", versesCount: 43, startPage: 249 },
  { number: 14, name: "Ibrahim", arabicName: "إبراهيم", versesCount: 52, startPage: 255 },
  { number: 15, name: "Al-Hijr", arabicName: "الحجر", versesCount: 99, startPage: 262 },
  { number: 16, name: "An-Nahl", arabicName: "النحل", versesCount: 128, startPage: 267 },
  { number: 17, name: "Al-Isra", arabicName: "الإسراء", versesCount: 111, startPage: 282 },
  { number: 18, name: "Al-Kahf", arabicName: "الكهف", versesCount: 110, startPage: 293 },
  { number: 19, name: "Maryam", arabicName: "مريم", versesCount: 98, startPage: 305 },
  { number: 20, name: "Ta-Ha", arabicName: "طه", versesCount: 135, startPage: 312 },
  { number: 21, name: "Al-Anbiya", arabicName: "الأنبياء", versesCount: 112, startPage: 322 },
  { number: 22, name: "Al-Hajj", arabicName: "الحج", versesCount: 78, startPage: 332 },
  { number: 23, name: "Al-Mu'minun", arabicName: "المؤمنون", versesCount: 118, startPage: 342 },
  { number: 24, name: "An-Nur", arabicName: "النور", versesCount: 64, startPage: 350 },
  { number: 25, name: "Al-Furqan", arabicName: "الفرقان", versesCount: 77, startPage: 359 },
  { number: 26, name: "Ash-Shu'ara", arabicName: "الشعراء", versesCount: 227, startPage: 367 },
  { number: 27, name: "An-Naml", arabicName: "النمل", versesCount: 93, startPage: 377 },
  { number: 28, name: "Al-Qasas", arabicName: "القصص", versesCount: 88, startPage: 385 },
  { number: 29, name: "Al-'Ankabut", arabicName: "العنكبوت", versesCount: 69, startPage: 396 },
  { number: 30, name: "Ar-Rum", arabicName: "الروم", versesCount: 60, startPage: 404 },
  { number: 31, name: "Luqman", arabicName: "لقمان", versesCount: 34, startPage: 411 },
  { number: 32, name: "As-Sajda", arabicName: "السجدة", versesCount: 30, startPage: 415 },
  { number: 33, name: "Al-Ahzab", arabicName: "الأحزاب", versesCount: 73, startPage: 418 },
  { number: 34, name: "Saba", arabicName: "سبأ", versesCount: 54, startPage: 428 },
  { number: 35, name: "Fatir", arabicName: "فاطر", versesCount: 45, startPage: 434 },
  { number: 36, name: "Ya-Sin", arabicName: "يس", versesCount: 83, startPage: 440 },
  { number: 37, name: "As-Saffat", arabicName: "الصافات", versesCount: 182, startPage: 446 },
  { number: 38, name: "Sad", arabicName: "ص", versesCount: 88, startPage: 453 },
  { number: 39, name: "Az-Zumar", arabicName: "الزمر", versesCount: 75, startPage: 458 },
  { number: 40, name: "Ghafir", arabicName: "غافر", versesCount: 85, startPage: 467 },
  { number: 41, name: "Fussilat", arabicName: "فصلت", versesCount: 54, startPage: 477 },
  { number: 42, name: "Ash-Shura", arabicName: "الشورى", versesCount: 53, startPage: 483 },
  { number: 43, name: "Az-Zukhruf", arabicName: "الزخرف", versesCount: 89, startPage: 489 },
  { number: 44, name: "Ad-Dukhan", arabicName: "الدخان", versesCount: 59, startPage: 496 },
  { number: 45, name: "Al-Jathiya", arabicName: "الجاثية", versesCount: 37, startPage: 499 },
  { number: 46, name: "Al-Ahqaf", arabicName: "الأحقاف", versesCount: 35, startPage: 502 },
  { number: 47, name: "Muhammad", arabicName: "محمد", versesCount: 38, startPage: 507 },
  { number: 48, name: "Al-Fath", arabicName: "الفتح", versesCount: 29, startPage: 511 },
  { number: 49, name: "Al-Hujurat", arabicName: "الحجرات", versesCount: 18, startPage: 515 },
  { number: 50, name: "Qaf", arabicName: "ق", versesCount: 45, startPage: 518 },
  { number: 51, name: "Adh-Dhariyat", arabicName: "الذاريات", versesCount: 60, startPage: 520 },
  { number: 52, name: "At-Tur", arabicName: "الطور", versesCount: 49, startPage: 523 },
  { number: 53, name: "An-Najm", arabicName: "النجم", versesCount: 62, startPage: 526 },
  { number: 54, name: "Al-Qamar", arabicName: "القمر", versesCount: 55, startPage: 528 },
  { number: 55, name: "Ar-Rahman", arabicName: "الرحمن", versesCount: 78, startPage: 531 },
  { number: 56, name: "Al-Waqi'a", arabicName: "الواقعة", versesCount: 96, startPage: 534 },
  { number: 57, name: "Al-Hadid", arabicName: "الحديد", versesCount: 29, startPage: 537 },
  { number: 58, name: "Al-Mujadila", arabicName: "المجادلة", versesCount: 22, startPage: 542 },
  { number: 59, name: "Al-Hashr", arabicName: "الحشر", versesCount: 24, startPage: 545 },
  { number: 60, name: "Al-Mumtahina", arabicName: "الممتحنة", versesCount: 13, startPage: 549 },
  { number: 61, name: "As-Saff", arabicName: "الصف", versesCount: 14, startPage: 551 },
  { number: 62, name: "Al-Jumu'a", arabicName: "الجمعة", versesCount: 11, startPage: 553 },
  { number: 63, name: "Al-Munafiqun", arabicName: "المنافقون", versesCount: 11, startPage: 554 },
  { number: 64, name: "At-Taghabun", arabicName: "التغابن", versesCount: 18, startPage: 556 },
  { number: 65, name: "At-Talaq", arabicName: "الطلاق", versesCount: 12, startPage: 558 },
  { number: 66, name: "At-Tahrim", arabicName: "التحريم", versesCount: 12, startPage: 560 },
  { number: 67, name: "Al-Mulk", arabicName: "الملك", versesCount: 30, startPage: 562 },
  { number: 68, name: "Al-Qalam", arabicName: "القلم", versesCount: 52, startPage: 564 },
  { number: 69, name: "Al-Haqqa", arabicName: "الحاقة", versesCount: 52, startPage: 566 },
  { number: 70, name: "Al-Ma'arij", arabicName: "المعارج", versesCount: 44, startPage: 568 },
  { number: 71, name: "Nuh", arabicName: "نوح", versesCount: 28, startPage: 570 },
  { number: 72, name: "Al-Jinn", arabicName: "الجن", versesCount: 28, startPage: 572 },
  { number: 73, name: "Al-Muzzammil", arabicName: "المزمل", versesCount: 20, startPage: 574 },
  { number: 74, name: "Al-Muddathir", arabicName: "المدثر", versesCount: 56, startPage: 575 },
  { number: 75, name: "Al-Qiyama", arabicName: "القيامة", versesCount: 40, startPage: 577 },
  { number: 76, name: "Al-Insan", arabicName: "الإنسان", versesCount: 31, startPage: 578 },
  { number: 77, name: "Al-Mursalat", arabicName: "المرسلات", versesCount: 50, startPage: 580 },
  { number: 78, name: "An-Naba", arabicName: "النبأ", versesCount: 40, startPage: 582 },
  { number: 79, name: "An-Nazi'at", arabicName: "النازعات", versesCount: 46, startPage: 583 },
  { number: 80, name: "'Abasa", arabicName: "عبس", versesCount: 42, startPage: 585 },
  { number: 81, name: "At-Takwir", arabicName: "التكوير", versesCount: 29, startPage: 586 },
  { number: 82, name: "Al-Infitar", arabicName: "الانفطار", versesCount: 19, startPage: 587 },
  { number: 83, name: "Al-Mutaffifin", arabicName: "المطففين", versesCount: 36, startPage: 587 },
  { number: 84, name: "Al-Inshiqaq", arabicName: "الانشقاق", versesCount: 25, startPage: 589 },
  { number: 85, name: "Al-Buruj", arabicName: "البروج", versesCount: 22, startPage: 590 },
  { number: 86, name: "At-Tariq", arabicName: "الطارق", versesCount: 17, startPage: 591 },
  { number: 87, name: "Al-A'la", arabicName: "الأعلى", versesCount: 19, startPage: 591 },
  { number: 88, name: "Al-Ghashiya", arabicName: "الغاشية", versesCount: 26, startPage: 592 },
  { number: 89, name: "Al-Fajr", arabicName: "الفجر", versesCount: 30, startPage: 593 },
  { number: 90, name: "Al-Balad", arabicName: "البلد", versesCount: 20, startPage: 594 },
  { number: 91, name: "Ash-Shams", arabicName: "الشمس", versesCount: 15, startPage: 595 },
  { number: 92, name: "Al-Layl", arabicName: "الليل", versesCount: 21, startPage: 595 },
  { number: 93, name: "Ad-Duha", arabicName: "الضحى", versesCount: 11, startPage: 596 },
  { number: 94, name: "Ash-Sharh", arabicName: "الشرح", versesCount: 8, startPage: 596 },
  { number: 95, name: "At-Tin", arabicName: "التين", versesCount: 8, startPage: 597 },
  { number: 96, name: "Al-'Alaq", arabicName: "العلق", versesCount: 19, startPage: 597 },
  { number: 97, name: "Al-Qadr", arabicName: "القدر", versesCount: 5, startPage: 598 },
  { number: 98, name: "Al-Bayyina", arabicName: "البينة", versesCount: 8, startPage: 598 },
  { number: 99, name: "Az-Zalzala", arabicName: "الزلزلة", versesCount: 8, startPage: 599 },
  { number: 100, name: "Al-'Adiyat", arabicName: "العاديات", versesCount: 11, startPage: 599 },
  { number: 101, name: "Al-Qari'a", arabicName: "القارعة", versesCount: 11, startPage: 600 },
  { number: 102, name: "At-Takathur", arabicName: "التكاثر", versesCount: 8, startPage: 600 },
  { number: 103, name: "Al-'Asr", arabicName: "العصر", versesCount: 3, startPage: 601 },
  { number: 104, name: "Al-Humaza", arabicName: "الهمزة", versesCount: 9, startPage: 601 },
  { number: 105, name: "Al-Fil", arabicName: "الفيل", versesCount: 5, startPage: 601 },
  { number: 106, name: "Quraysh", arabicName: "قريش", versesCount: 4, startPage: 602 },
  { number: 107, name: "Al-Ma'un", arabicName: "الماعون", versesCount: 7, startPage: 602 },
  { number: 108, name: "Al-Kawthar", arabicName: "الكوثر", versesCount: 3, startPage: 602 },
  { number: 109, name: "Al-Kafirun", arabicName: "الكافرون", versesCount: 6, startPage: 603 },
  { number: 110, name: "An-Nasr", arabicName: "النصر", versesCount: 3, startPage: 603 },
  { number: 111, name: "Al-Masad", arabicName: "المسد", versesCount: 5, startPage: 603 },
  { number: 112, name: "Al-Ikhlas", arabicName: "الإخلاص", versesCount: 4, startPage: 604 },
  { number: 113, name: "Al-Falaq", arabicName: "الفلق", versesCount: 5, startPage: 604 },
  { number: 114, name: "An-Nas", arabicName: "الناس", versesCount: 6, startPage: 604 },
];

export const TOTAL_QURAN_PAGES = 604;
export const TOTAL_QURAN_VERSES = 6236;

// Calculate approximate page from surah and ayah
export function calculatePageFromPosition(surahNumber: number, ayahNumber: number): number {
  const surah = SURAHS.find(s => s.number === surahNumber);
  if (!surah) return 1;
  
  const nextSurah = SURAHS.find(s => s.number === surahNumber + 1);
  const endPage = nextSurah ? nextSurah.startPage - 1 : TOTAL_QURAN_PAGES;
  const surahPages = endPage - surah.startPage + 1;
  
  // Estimate page based on verse position within surah
  const verseProgress = ayahNumber / surah.versesCount;
  const estimatedPage = Math.floor(surah.startPage + (surahPages * verseProgress));
  
  return Math.min(Math.max(estimatedPage, surah.startPage), endPage);
}

// Get surah by number
export function getSurahByNumber(number: number): Surah | undefined {
  return SURAHS.find(s => s.number === number);
}

// Search surahs by name
export function searchSurahs(query: string): Surah[] {
  const lowerQuery = query.toLowerCase();
  return SURAHS.filter(s => 
    s.name.toLowerCase().includes(lowerQuery) ||
    s.arabicName.includes(query) ||
    s.number.toString() === query
  );
}
