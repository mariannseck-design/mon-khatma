import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Check, AlertCircle, Sparkles, MessageCircle, HandHeart, UtensilsCrossed, MoreHorizontal } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const sectionCards = [
  {
    id: 'inspirations',
    title: 'Inspirations',
    description: 'Partage de versets et réflexions spirituelles',
    icon: Sparkles,
    gradient: 'bg-gradient-mint',
    iconBg: 'bg-primary/20',
  },
  {
    id: 'entraide',
    title: 'Entraide & Conseils',
    description: 'Questions et échanges entre sœurs',
    icon: MessageCircle,
    gradient: 'bg-gradient-lavender',
    iconBg: 'bg-accent/30',
  },
  {
    id: 'douas',
    title: 'Douas & Soutien',
    description: 'Demandes de prières et encouragements',
    icon: HandHeart,
    gradient: 'bg-gradient-peach',
    iconBg: 'bg-peach/30',
  },
  {
    id: 'ramadan',
    title: 'Plats du Ramadan',
    description: 'Recettes et idées pour le Ramadan',
    icon: UtensilsCrossed,
    gradient: 'bg-gradient-sky',
    iconBg: 'bg-sky/30',
  },
  {
    id: 'divers',
    title: 'Divers',
    description: 'Autres sujets et discussions',
    icon: MoreHorizontal,
    gradient: 'bg-gradient-warm',
    iconBg: 'bg-muted/50',
  },
];

interface Circle {
  id: string;
  name: string;
  description: string | null;
  max_members: number;
}

interface Membership {
  id: string;
  circle_id: string;
  accepted_charter: boolean;
}

export default function CerclePage() {
  const { user } = useAuth();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [showCharter, setShowCharter] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCircleData();
  }, [user]);

  const fetchCircleData = async () => {
    if (!user) return;
    setLoading(true);

    // Get the main circle
    const { data: circles } = await supabase
      .from('sisters_circles')
      .select('*')
      .limit(1);
    
    if (circles && circles.length > 0) {
      setCircle(circles[0]);
      
      // Check membership
      const { data: membershipData } = await supabase
        .from('circle_members')
        .select('*')
        .eq('circle_id', circles[0].id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      setMembership(membershipData);

      // Count members
      const { count } = await supabase
        .from('circle_members')
        .select('*', { count: 'exact', head: true })
        .eq('circle_id', circles[0].id);
      
      setMemberCount(count || 0);
    }

    setLoading(false);
  };

  const joinCircle = async () => {
    if (!user || !circle) return;

    if (memberCount >= circle.max_members) {
      toast.error('Le cercle est complet (30 sœurs maximum)');
      return;
    }

    setShowCharter(true);
  };

  const acceptCharter = async () => {
    if (!user || !circle) return;

    const { error } = await supabase
      .from('circle_members')
      .insert({
        circle_id: circle.id,
        user_id: user.id,
        accepted_charter: true
      });

    if (error) {
      toast.error('Erreur lors de l\'inscription');
      return;
    }

    toast.success('Bienvenue dans le Cercle des Sœurs! 🌙');
    setShowCharter(false);
    fetchCircleData();
  };

  if (loading) {
    return (
      <AppLayout title="Cercle">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Cercle des Sœurs">
      <div className="section-spacing">
        {/* Header */}
        <div className="zen-header">
          <h1>👭 Cercle des Sœurs</h1>
          <p className="text-muted-foreground">
            Un espace de lecture collective avec l'aide d'Allah <span className="honorific">(عز وجل)</span>
          </p>
        </div>

        {/* Circle Status */}
        {circle ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="illustrated-card bg-gradient-lavender">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center">
                  <Users className="h-7 w-7 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-accent-foreground">{circle.name}</h2>
                  <p className="text-sm text-accent-foreground/70">
                    {memberCount}/{circle.max_members} sœurs inscrites
                  </p>
                </div>
              </div>

              {circle.description && (
                <p className="text-accent-foreground/80 mb-4">{circle.description}</p>
              )}

              {/* Progress bar */}
              <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                <motion.div 
                  className="bg-white h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(memberCount / circle.max_members) * 100}%` }}
                />
              </div>
            </Card>
          </motion.div>
        ) : (
          <Card className="pastel-card p-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun cercle disponible pour le moment</p>
          </Card>
        )}

        {/* Membership Status */}
        {circle && (
          <Card className="pastel-card p-6">
            {membership ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-success" />
                </div>
                <h3 className="font-display text-lg text-foreground mb-2">Tu fais partie du Cercle!</h3>
                <p className="text-muted-foreground text-sm">
                  Qu'Allah <span className="honorific">(عز وجل)</span> t'accorde la constance dans ta lecture.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Heart className="h-12 w-12 text-peach mx-auto mb-4" />
                <h3 className="font-display text-lg text-foreground mb-2">Rejoins le Cercle</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Un groupe de 30 sœurs pour lire le Coran ensemble
                </p>
                <Button 
                  onClick={joinCircle}
                  className="bg-primary text-primary-foreground hover-lift"
                  disabled={memberCount >= circle.max_members}
                >
                  {memberCount >= circle.max_members ? 'Cercle complet' : 'Rejoindre le Cercle'}
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Section Cards - Only visible for members */}
        {membership && (
          <div className="space-y-4">
            <h2 className="font-display text-lg text-foreground">Espaces d'échange</h2>
            
            <div className="grid gap-4">
              {sectionCards.map((section, index) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`${section.gradient} p-5 cursor-pointer hover-lift active:scale-[0.98] transition-all`}
                      onClick={() => toast.info(`Section "${section.title}" - Bientôt disponible insha'Allah!`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${section.iconBg} flex items-center justify-center`}>
                          <Icon className="h-6 w-6 text-foreground/80" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-lg text-foreground">{section.title}</h3>
                          <p className="text-sm text-muted-foreground">{section.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Benefits - Only visible for non-members */}
        {!membership && (
          <div className="space-y-3">
            <h2 className="font-display text-lg text-foreground">Les bienfaits du Cercle</h2>
            
            {[
              { emoji: '📖', text: 'Lecture quotidienne avec suivi' },
              { emoji: '🤝', text: 'Motivation entre sœurs' },
              { emoji: '🌙', text: 'Rappels et encouragements' },
              { emoji: '✨', text: 'Célébrations des accomplissements' },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="pastel-card p-4 flex items-center gap-3">
                  <span className="text-2xl">{benefit.emoji}</span>
                  <p className="text-foreground">{benefit.text}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Charter Modal */}
      <Dialog open={showCharter} onOpenChange={setShowCharter}>
        <DialogContent className="max-w-sm mx-4 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-center">
              Charte du Cercle des Sœurs
            </DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div className="space-y-4 text-foreground">
              <p className="text-center text-muted-foreground">
                Bienvenue, chère sœur! En rejoignant ce cercle, tu t'engages à:
              </p>
              
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span>Lire régulièrement selon ton objectif</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span>Encourager tes sœurs avec bienveillance</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span>Respecter la confidentialité du groupe</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span>Faire preuve de patience et de constance</span>
                </li>
              </ul>

              <Button 
                onClick={acceptCharter}
                className="w-full bg-primary text-primary-foreground mt-4"
              >
                Je rejoins le Cercle avec l'aide d'Allah <span className="honorific ml-1">(عز وجل)</span>
              </Button>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
