import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Frown, Meh, Heart, Cloud, Sun, Sparkles, Trash2, Edit3, Calendar, MoreVertical, Flower2, Moon, Sunrise, BookOpen, ChevronDown, MapPin, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  { title: 'Zikr du matin', icon: Sunrise, bg: '#e8d5a3', text: '#1b4332', border: '' },
  { title: 'Zikr du soir', icon: Moon, bg: '#1a1a2e', text: '#ffffff', border: '' },
  { title: 'Après la prière', icon: BookOpen, bg: '#c8d5c0', text: '#1b4332', border: '' },
  { title: 'Toute occasion', icon: Heart, bg: '#f0ebe3', text: '#1b4332', border: '' },
  { title: 'Sujud Tilawah', icon: ChevronDown, bg: '#c67a5c', text: '#ffffff', border: '' },
  { title: 'Duas Omra', icon: MapPin, bg: '#faf8f5', text: '#1b4332', border: '#b5942e' },
  { title: 'Duas Hajj', icon: Landmark, bg: '#2d6a4f', text: '#b5942e', border: '' },
  { title: 'Istikharah', icon: Sparkles, bg: '#dce8f0', text: '#1b4332', border: '' },
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
  const { user } = useAuth();
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

        {/* Grille unifiée */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 8 cartes Dhikr d'abord */}
          {dhikrCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                variants={itemVariants}
                className="relative overflow-hidden rounded-2xl p-5 flex flex-col items-center justify-center text-center aspect-[4/3]"
                style={{
                  background: card.bg,
                  border: card.border ? `1.5px solid ${card.border}` : '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 2px 12px -2px rgba(0,0,0,0.08)',
                }}
              >
                <span
                  className="absolute top-2 right-2 text-[9px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm"
                  style={{
                    background: 'rgba(255,255,255,0.35)',
                    color: card.text,
                    border: '1px solid rgba(255,255,255,0.25)',
                  }}
                >
                  Bientôt
                </span>
                <Icon
                  className="h-7 w-7 mb-2 opacity-80"
                  strokeWidth={1.5}
                  style={{ color: card.text }}
                />
                <h3
                  className="text-sm font-semibold leading-tight"
                  style={{ color: card.text, fontFamily: "'Inter', sans-serif" }}
                >
                  {card.title}
                </h3>
              </motion.div>
            );
          })}

          {/* Carte Mes Émotions — en bas */}
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
            <Flower2
              className="h-7 w-7 mb-2 opacity-80"
              strokeWidth={1.5}
              style={{ color: '#1b4332' }}
            />
            <h3
              className="text-sm font-semibold leading-tight"
              style={{ color: '#1b4332', fontFamily: "'Inter', sans-serif" }}
            >
              Mes Émotions
            </h3>
          </motion.button>

          {/* Carte Mes Favoris — navigue vers Accueil Mon Univers */}
          <motion.button
            variants={itemVariants}
            onClick={() => navigate('/accueil?tab=univers')}
            className="relative overflow-hidden rounded-2xl p-5 flex flex-col items-center justify-center text-center aspect-[4/3]"
            style={{
              background: '#faf8f5',
              border: '1.5px solid #b5942e',
              boxShadow: '0 2px 12px -2px rgba(0,0,0,0.08)',
            }}
          >
            <Heart
              className="h-7 w-7 mb-2 text-red-500 opacity-80"
              strokeWidth={1.5}
              fill="rgba(220,38,38,0.3)"
            />
            <h3
              className="text-sm font-semibold leading-tight"
              style={{ color: '#1b4332', fontFamily: "'Inter', sans-serif" }}
            >
              Mes Favoris
            </h3>
          </motion.button>
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
        </div>
      </div>
    </AppLayout>
  );
}
