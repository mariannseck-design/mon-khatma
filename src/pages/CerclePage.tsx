import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Check, AlertCircle, Sparkles, MessageCircle, Bell } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SectionCard } from '@/components/cercle/SectionCard';
import { SectionView } from '@/components/cercle/SectionView';
import { CollectiveCounter } from '@/components/cercle/CollectiveCounter';

const sectionCards = [
  {
    id: 'inspirations' as const,
    title: 'Inspirations',
    description: 'Partage de versets et réflexions spirituelles',
    icon: Sparkles,
    gradient: 'bg-gradient-mint',
    iconBg: 'bg-primary/20',
  },
  {
    id: 'entraide' as const,
    title: 'Entraide & Conseils',
    description: 'Une difficulté aujourd\'hui ? Demandez conseil à vos sœurs ici',
    icon: MessageCircle,
    gradient: 'bg-gradient-lavender',
    iconBg: 'bg-accent/30',
  },
  {
    id: 'rappels' as const,
    title: 'Rappels & Encouragements',
    description: 'Partagez ici votre verset du jour ou un petit mot pour motiver les sœurs. Chaque rappel, même modeste, est une graine de lumière',
    icon: Bell,
    gradient: 'bg-gradient-peach',
    iconBg: 'bg-peach/30',
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

type SectionType = 'inspirations' | 'entraide' | 'rappels';

export default function CerclePage() {
  const { user } = useAuth();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [showCharter, setShowCharter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionType | null>(null);

  useEffect(() => {
    fetchCircleData();
  }, [user]);

  const fetchCircleData = async () => {
    if (!user) return;
    setLoading(true);

    const { data: circles } = await supabase
      .from('sisters_circles')
      .select('*')
      .limit(1);

    if (circles && circles.length > 0) {
      setCircle(circles[0]);

      const { data: membershipData } = await supabase
        .from('circle_members')
        .select('*')
        .eq('circle_id', circles[0].id)
        .eq('user_id', user.id)
        .maybeSingle();

      setMembership(membershipData);

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
    setShowCharter(true);
  };

  const acceptCharter = async () => {
    if (!user || !circle) return;

    const { error } = await supabase.from('circle_members').insert({
      circle_id: circle.id,
      user_id: user.id,
      accepted_charter: true,
    });

    if (error) {
      toast.error("Erreur lors de l'inscription");
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

  // If a section is active, show the section view
  if (activeSection && circle && membership) {
    const sectionInfo = sectionCards.find(s => s.id === activeSection);
    return (
      <AppLayout title="Cercle des Sœurs">
        <div className="section-spacing">
          <SectionView
            circleId={circle.id}
            section={activeSection}
            title={sectionInfo?.title || ''}
            onBack={() => setActiveSection(null)}
          />
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
            Un espace d'entraide avec l'aide d'Allah <span className="honorific">(عز وجل)</span>
          </p>
        </div>

        {/* Circle Status */}
        {circle ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="illustrated-card bg-gradient-lavender">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center">
                  <Users className="h-7 w-7 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-accent-foreground">{circle.name}</h2>
                  <p className="text-sm text-accent-foreground/70">
                    {memberCount} sœur{memberCount > 1 ? 's' : ''} inscrite{memberCount > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {circle.description && (
                <p className="text-accent-foreground/80">{circle.description}</p>
              )}
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
                  Un groupe d'entraide entre sœurs fillah
                </p>
                <Button
                  onClick={joinCircle}
                  className="bg-primary text-primary-foreground hover-lift"
                >
                  Rejoindre le Cercle
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
              {sectionCards.map((section, index) => (
                <SectionCard
                  key={section.id}
                  {...section}
                  onClick={() => setActiveSection(section.id)}
                  index={index}
                />
              ))}
            </div>

            {/* Collective Counter */}
            <div className="mt-6">
              <h2 className="font-display text-lg text-foreground mb-4">Célébrations</h2>
              <CollectiveCounter />
            </div>
          </div>
        )}

        {/* Benefits - Only visible for non-members */}
        {!membership && (
          <div className="space-y-3">
            <h2 className="font-display text-lg text-foreground">Les bienfaits du Cercle</h2>

            {[
              { emoji: '📖', title: 'Lecture quotidienne', description: 'avec suivi personnalisé' },
              { emoji: '🤝', title: 'Motivation entre sœurs', description: 'Une difficulté aujourd\'hui ? Demandez conseil à vos sœurs ici' },
              { emoji: '🌙', title: 'Rappels et encouragements', description: 'Partagez ici votre verset du jour ou un petit mot pour motiver les sœurs. Chaque rappel, même modeste, est une graine de lumière.' },
              { emoji: '✨', title: 'Célébrations', description: 'des accomplissements ensemble' },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="pastel-card p-4 flex items-center gap-3">
                  <span className="text-2xl">{benefit.emoji}</span>
                  <div>
                    <p className="text-foreground font-semibold">{benefit.title}</p>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </div>
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
