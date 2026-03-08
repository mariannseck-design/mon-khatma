import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Frown, Meh, Heart, Cloud, Sun, Sparkles, Trash2, Edit3, Calendar, MoreVertical, Flower2, Moon, Sunrise, BookOpen, ChevronDown, MapPin, Landmark, ShieldPlus, BookHeart } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MoodDuaCard } from '@/components/emotions/MoodDuaCard';
import FavoriteVersesSection from '@/components/favoris/FavoriteVersesSection';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MoodEntry {
  id: string;
  mood_value: number;
  mood_label: string;
  gratitude: string | null;
  entry_date: string;
  created_at: string;
}

const moods = [
  { icon: Sun, label: 'Sereine', value: 5, color: 'bg-gradient-mint' },
  { icon: Smile, label: 'Bien', value: 4, color: 'bg-gradient-sky' },
  { icon: Meh, label: 'Neutre', value: 3, color: 'bg-muted' },
  { icon: Cloud, label: 'Fatiguée', value: 2, color: 'bg-gradient-lavender' },
  { icon: Frown, label: 'Difficile', value: 1, color: 'bg-gradient-peach' },
];

const dhikrCards = [
  { id: 'morning', title: 'Zikr du matin', icon: Sunrise, bg: '#e8d5a3', text: '#1b4332', border: '', enabled: true },
  { id: 'evening', title: 'Zikr du soir', icon: Moon, bg: '#1a1a2e', text: '#ffffff', border: '', enabled: true },
  { id: 'prayer', title: 'Après la prière', icon: BookOpen, bg: '#c8d5c0', text: '#1b4332', border: '', enabled: true },
  { id: 'chifa', title: 'Chifâ & Sérénité', icon: ShieldPlus, bg: '#065F46', text: '#D4AF37', border: '', enabled: true },
  { id: 'louanges', title: 'Louanges & Istighfar', icon: Sparkles, bg: '#2d6a4f', text: '#d4af37', border: '', enabled: true },
  { id: 'anytime', title: 'Toute occasion', icon: Heart, bg: '#f0ebe3', text: '#1b4332', border: '', enabled: false },
  { id: 'sujud', title: 'Sujud Tilawah', icon: ChevronDown, bg: '#c67a5c', text: '#ffffff', border: '', enabled: false },
  { id: 'omra', title: 'Duas Omra', icon: MapPin, bg: '#faf8f5', text: '#1b4332', border: '#b5942e', enabled: false },
  { id: 'hajj', title: 'Duas Hajj', icon: Landmark, bg: '#faf8f5', text: '#1b4332', border: '#b5942e', enabled: false },
  { id: 'istikharah', title: 'Istikharah', icon: Sparkles, bg: '#dce8f0', text: '#1b4332', border: '', enabled: false },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function EmotionsPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [gratitude, setGratitude] = useState('');
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmotions, setShowEmotions] = useState(false);
  const moodSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching entries:', error);
    } else {
      setEntries(data || []);
    }
  };

  const handleSave = async () => {
    if (!selectedMood || !user) {
      toast.error('Sélectionne ton humeur d\'abord');
      return;
    }
    
    setIsLoading(true);
    const moodData = moods.find(m => m.value === selectedMood);

    if (editingId) {
      const { error } = await supabase
        .from('mood_entries')
        .update({
          mood_value: selectedMood,
          mood_label: moodData?.label || '',
          gratitude: gratitude || null,
        })
        .eq('id', editingId);

      if (error) {
        toast.error('Erreur lors de la mise à jour');
        console.error(error);
      } else {
        toast.success('Moment mis à jour! 🌙');
        resetForm();
        fetchEntries();
      }
    } else {
      const { error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          mood_value: selectedMood,
          mood_label: moodData?.label || '',
          gratitude: gratitude || null,
        });

      if (error) {
        toast.error('Erreur lors de l\'enregistrement');
        console.error(error);
      } else {
        toast.success('Masha\'Allah, continue ainsi! 🌙');
        resetForm();
        fetchEntries();
      }
    }
    
    setIsLoading(false);
  };

  const resetForm = () => {
    setSelectedMood(null);
    setGratitude('');
    setEditingId(null);
  };

  const handleEdit = (entry: MoodEntry) => {
    setSelectedMood(entry.mood_value);
    setGratitude(entry.gratitude || '');
    setEditingId(entry.id);
    moodSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('mood_entries')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    } else {
      toast.success('Entrée supprimée');
      fetchEntries();
    }
  };

  const getMoodIcon = (value: number) => {
    const mood = moods.find(m => m.value === value);
    return mood?.icon || Meh;
  };

  const getMoodColor = (value: number) => {
    const mood = moods.find(m => m.value === value);
    return mood?.color || 'bg-muted';
  };

  return (
    <AppLayout title="Mon Dhikr Quotidien">
      <div className="section-spacing">
        {/* Header */}
        <h1
          className="text-xl font-bold tracking-[0.06em] uppercase text-center"
          style={{ fontFamily: "'Inter', sans-serif", color: '#2d6a4f' }}
        >
          Mon Dhikr Quotidien
        </h1>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          {/* Après la prière — pleine largeur */}
          {(() => {
            const prayer = dhikrCards.find(c => c.id === 'prayer')!;
            const PrayerIcon = prayer.icon;
            return (
              <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer"
                style={{
                  background: prayer.bg,
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 2px 12px -2px rgba(0,0,0,0.08)',
                  minHeight: '100px',
                }}
                onClick={() => navigate(`/dhikr?category=${prayer.id}`)}
                whileTap={{ scale: 0.96 }}
              >
                <PrayerIcon className="h-7 w-7 mb-2 opacity-80" strokeWidth={1.5} style={{ color: prayer.text }} />
                <h3 className="text-sm font-semibold leading-tight" style={{ color: prayer.text, fontFamily: "'Inter', sans-serif" }}>
                  {prayer.title}
                </h3>
              </motion.div>
            );
          })()}

          {/* Zikr du matin & du soir — côte à côte */}
          <div className="grid grid-cols-2 gap-4">
            {dhikrCards.filter(c => c.id === 'morning' || c.id === 'evening').map((card) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.id}
                  variants={itemVariants}
                  className="relative overflow-hidden rounded-2xl p-5 flex flex-col items-center justify-center text-center aspect-[4/3] cursor-pointer"
                  style={{
                    background: card.bg,
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 2px 12px -2px rgba(0,0,0,0.08)',
                  }}
                  onClick={() => navigate(`/dhikr?category=${card.id}`)}
                  whileTap={{ scale: 0.96 }}
                >
                  <Icon className="h-7 w-7 mb-2 opacity-80" strokeWidth={1.5} style={{ color: card.text }} />
                  <h3 className="text-sm font-semibold leading-tight" style={{ color: card.text, fontFamily: "'Inter', sans-serif" }}>
                    {card.title}
                  </h3>
                </motion.div>
              );
            })}
          </div>

          {/* Sources de Lumière & Mes Douas — empilées, taille réduite */}
          <div className="space-y-2">
            <Link to="/sources-de-lumiere" className="block">
              <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-xl p-3.5"
                style={{
                  background: 'linear-gradient(135deg, #faf8f5 0%, #f5e6c8 100%)',
                  border: '2px solid #b5942e',
                  boxShadow: '0 4px 16px -4px rgba(181,148,46,0.2)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(181,148,46,0.12)', border: '1px solid rgba(181,148,46,0.25)' }}>
                    <Sparkles className="h-5 w-5" style={{ color: '#b5942e' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold tracking-[0.04em]" style={{ fontFamily: "'Inter', sans-serif", color: '#b5942e' }}>
                      Les Sources de Lumière
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: '#2d6a4f' }}>Coran · Sunna · Salawât</p>
                  </div>
                </div>
              </motion.div>
            </Link>
            <Link to="/douas" className="block">
              <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-xl p-3.5"
                style={{
                  background: '#faf8f5',
                  border: '1.5px solid rgba(181,148,46,0.4)',
                  boxShadow: '0 3px 12px -4px rgba(181,148,46,0.12)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(181,148,46,0.1)', border: '1px solid rgba(181,148,46,0.2)' }}>
                    <BookHeart className="h-5 w-5" style={{ color: '#b5942e' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold tracking-[0.04em]" style={{ fontFamily: "'Inter', sans-serif", color: '#b5942e' }}>
                      Mes Douas
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: '#2d6a4f' }}>Aube · Passages · Quotidien · Réconfort</p>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Reste des cartes en grille 2 colonnes */}
          <div className="grid grid-cols-2 gap-4">
            {dhikrCards.filter(c => !['prayer', 'morning', 'evening'].includes(c.id)).map((card) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.id}
                  variants={itemVariants}
                  className={`relative overflow-hidden rounded-2xl p-5 flex flex-col items-center justify-center text-center aspect-[4/3] ${(card.enabled || isAdmin) ? 'cursor-pointer' : ''}`}
                  style={{
                    background: card.bg,
                    border: card.border ? `1.5px solid ${card.border}` : '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 2px 12px -2px rgba(0,0,0,0.08)',
                  }}
                  onClick={() => (card.enabled || isAdmin) && navigate(`/dhikr?category=${card.id}`)}
                  whileTap={(card.enabled || isAdmin) ? { scale: 0.96 } : {}}
                >
                  {!card.enabled && !isAdmin && (
                    <span className="absolute top-2 right-2 text-[9px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm"
                      style={{ background: 'rgba(255,255,255,0.35)', color: card.text, border: '1px solid rgba(255,255,255,0.25)' }}>
                      Bientôt
                    </span>
                  )}
                  <Icon className="h-7 w-7 mb-2 opacity-80" strokeWidth={1.5} style={{ color: card.text }} />
                  <h3 className="text-sm font-semibold leading-tight" style={{ color: card.text, fontFamily: "'Inter', sans-serif" }}>
                    {card.title}
                  </h3>
                </motion.div>
              );
            })}

            {/* Carte Mes Émotions */}
            <motion.button
              variants={itemVariants}
              onClick={() => {
                setShowEmotions(prev => !prev);
                if (!showEmotions) {
                  setTimeout(() => moodSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 150);
                }
              }}
              className="relative overflow-hidden rounded-2xl p-5 flex flex-col items-center justify-center text-center aspect-[4/3]"
              style={{
                background: '#f0ebe3',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 2px 12px -2px rgba(0,0,0,0.08)',
              }}
            >
              <Flower2 className="h-7 w-7 mb-2 opacity-80" strokeWidth={1.5} style={{ color: '#1b4332' }} />
              <h3 className="text-sm font-semibold leading-tight" style={{ color: '#1b4332', fontFamily: "'Inter', sans-serif" }}>
                Mes Émotions
              </h3>
            </motion.button>
          </div>
        </motion.div>

        {/* Section Émotions */}
        <AnimatePresence>
          {showEmotions && (
            <motion.div
              ref={moodSectionRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden space-y-4"
            >
          <Card className="pastel-card p-6">
            <h3 className="font-display text-lg mb-4 text-center">
              {editingId ? 'Modifier mon humeur' : 'Mon humeur aujourd\'hui'}
            </h3>
            
            <div className="flex justify-center gap-3">
              {moods.map((mood) => {
                const Icon = mood.icon;
                const isSelected = selectedMood === mood.value;
                
                return (
                  <motion.button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                      isSelected 
                        ? `${mood.color} scale-110 shadow-lg` 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className={`h-8 w-8 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`} />
                    <span className={`text-xs ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {mood.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </Card>

          {selectedMood && <MoodDuaCard moodValue={selectedMood} />}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="pastel-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-peach" />
                <h3 className="font-display text-lg">Gratitude</h3>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                Pour quoi es-tu reconnaissante aujourd'hui?
              </p>
              
              <Textarea
                placeholder="Alhamdulillah pour..."
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                className="min-h-[100px] rounded-xl resize-none"
              />
            </Card>
          </motion.div>

          <div className="flex gap-2">
            {editingId && (
              <Button 
                onClick={resetForm}
                variant="outline"
                className="flex-1 h-12 rounded-xl"
              >
                Annuler
              </Button>
            )}
            <Button 
              onClick={handleSave}
              disabled={isLoading || !selectedMood}
              className={`bg-primary text-primary-foreground hover-lift h-12 rounded-xl ${editingId ? 'flex-1' : 'w-full'}`}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {editingId ? 'Mettre à jour' : 'Enregistrer mon moment'}
            </Button>
          </div>

          {entries.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-display text-lg text-foreground">Mes moments précédents</h2>
              
              {entries.map((entry, index) => {
                const MoodIcon = getMoodIcon(entry.mood_value);
                
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="pastel-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-xl ${getMoodColor(entry.mood_value)} flex items-center justify-center shrink-0`}>
                            <MoodIcon className="h-5 w-5 text-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground">{entry.mood_label}</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(entry.entry_date), 'd MMM yyyy', { locale: fr })}
                              </span>
                            </div>
                            {entry.gratitude && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {entry.gratitude}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(entry)}>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(entry.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
