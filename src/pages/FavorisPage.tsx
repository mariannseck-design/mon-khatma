import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, MoreVertical, BookOpen, Copy, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SURAHS } from '@/lib/surahData';
import { getExactVersePage } from '@/lib/quranData';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FavoriteVerse {
  id: string;
  verse_key: string;
  surah_number: number;
  verse_number: number;
  arabic_text: string | null;
  translation_text: string | null;
  created_at: string;
}

function getSurahName(num: number) {
  return SURAHS.find(s => s.number === num)?.name || `Sourate ${num}`;
}

export default function FavorisPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [verses, setVerses] = useState<FavoriteVerse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('favorite_verses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (data) setVerses(data as FavoriteVerse[]);
        setLoading(false);
      });
  }, [user]);

  const openInMushaf = async (v: FavoriteVerse) => {
    const page = await getExactVersePage(v.surah_number, v.verse_number);
    localStorage.setItem('quran_reader_page', String(page));
    navigate('/quran-reader');
  };

  const shareVerse = (v: FavoriteVerse) => {
    const text = [v.arabic_text, v.translation_text, `— ${getSurahName(v.surah_number)} : ${v.verse_number}`]
      .filter(Boolean)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    toast({ title: 'Copié !', description: 'Le verset a été copié dans le presse-papier.' });
  };

  const removeVerse = async (id: string) => {
    setVerses(prev => prev.filter(v => v.id !== id));
    await supabase.from('favorite_verses').delete().eq('id', id);
    toast({ title: 'Supprimé', description: 'Le verset a été retiré de tes favoris.' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted active:scale-90 transition-transform"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Mes Versets Favoris</h1>
          <p className="text-xs text-muted-foreground">
            {verses.length} verset{verses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Heart className="h-5 w-5 text-red-400 ml-auto" fill="rgba(239,68,68,0.3)" />
      </div>

      {/* Content */}
      <div className="p-4 pb-24 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : verses.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Aucun verset sauvegardé</p>
            <p className="text-xs text-muted-foreground mb-4">
              Ouvre le Mushaf et touche le ❤️ sur un verset pour le sauvegarder ici.
            </p>
            <button
              onClick={() => navigate('/quran-reader')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground active:scale-95 transition-transform"
            >
              Ouvrir le Mushaf
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {verses.map((v) => (
              <motion.div
                key={v.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60 }}
                className="rounded-xl overflow-hidden bg-card border border-border"
              >
                {/* Verse header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border">
                  <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                    <BookOpen className="h-3 w-3" />
                    {getSurahName(v.surah_number)} : {v.verse_number}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted active:scale-90 transition-all">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => openInMushaf(v)} className="gap-2">
                        <BookOpen className="h-4 w-4" />
                        Ouvrir dans le Mushaf
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => shareVerse(v)} className="gap-2">
                        <Copy className="h-4 w-4" />
                        Copier / Partager
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => removeVerse(v.id)} className="gap-2 text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Verse body */}
                <div className="px-4 py-4">
                  {v.arabic_text && (
                    <p
                      className="text-right leading-[2.2] mb-3 text-foreground"
                      style={{ fontFamily: "'Scheherazade New', 'Amiri', serif", fontSize: '1.1rem' }}
                      dir="rtl"
                    >
                      {v.arabic_text}
                    </p>
                  )}
                  {v.translation_text && (
                    <p className="text-xs leading-relaxed italic text-muted-foreground">
                      {v.translation_text}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
