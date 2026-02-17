import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, BookOpen, TrendingUp, AlertCircle, Check, X } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, isAfter, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MemberProgress {
  user_id: string;
  display_name: string | null;
  joined_at: string;
  total_pages: number;
  last_read_date: string | null;
  is_behind: boolean;
}

export default function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const [members, setMembers] = useState<MemberProgress[]>([]);
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    totalMembers: 0,
    activeToday: 0,
    totalPagesThisWeek: 0,
    behindCount: 0
  });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    setLoadingData(true);

    // Get total registered users
    const { count: totalSubscribers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get all circle members with their profiles
    const { data: circleMembers } = await supabase
      .from('circle_members')
      .select(`
        user_id,
        joined_at
      `);

    if (!circleMembers) {
      setLoadingData(false);
      return;
    }

    const memberUserIds = circleMembers.map(m => m.user_id);

    // Get profiles for members
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', memberUserIds);

    // Get progress for all members
    const today = new Date().toISOString().split('T')[0];
    const lastWeek = subDays(new Date(), 7).toISOString().split('T')[0];

    const { data: progressData } = await supabase
      .from('quran_progress')
      .select('user_id, date, pages_read')
      .in('user_id', memberUserIds)
      .gte('date', lastWeek);

    // Process member data
    const memberProgressList: MemberProgress[] = circleMembers.map(member => {
      const profile = profiles?.find(p => p.user_id === member.user_id);
      const memberProgress = progressData?.filter(p => p.user_id === member.user_id) || [];
      const totalPages = memberProgress.reduce((sum, p) => sum + p.pages_read, 0);
      const lastReadEntry = memberProgress.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      
      const lastReadDate = lastReadEntry?.date || null;
      const twoDaysAgo = subDays(new Date(), 2).toISOString().split('T')[0];
      const isBehind = !lastReadDate || lastReadDate < twoDaysAgo;

      return {
        user_id: member.user_id,
        display_name: profile?.display_name || 'Membre anonyme',
        joined_at: member.joined_at,
        total_pages: totalPages,
        last_read_date: lastReadDate,
        is_behind: isBehind
      };
    });

    // Calculate stats
    const activeToday = progressData?.filter(p => p.date === today).length || 0;
    const totalPagesThisWeek = progressData?.reduce((sum, p) => sum + p.pages_read, 0) || 0;
    const behindCount = memberProgressList.filter(m => m.is_behind).length;

    setMembers(memberProgressList.sort((a, b) => b.total_pages - a.total_pages));
    setStats({
      totalSubscribers: totalSubscribers || 0,
      totalMembers: circleMembers.length,
      activeToday,
      totalPagesThisWeek,
      behindCount
    });
    setLoadingData(false);
  };

  if (loading) {
    return (
      <AppLayout title="Admin">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/accueil" replace />;
  }

  return (
    <AppLayout title="Dashboard Admin">
      <div className="section-spacing">
        {/* Header */}
        <div className="zen-header">
          <h1>🛡️ Tableau de Bord</h1>
          <p className="text-muted-foreground">Gestion de la Communauté</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total abonnés */}
          <Card className="pastel-card p-4 col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-lavender flex items-center justify-center">
                <Users className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalSubscribers}</p>
                <p className="text-xs text-muted-foreground">Abonnées inscrites</p>
              </div>
            </div>
          </Card>

          <Card className="pastel-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-lavender flex items-center justify-center">
                <Users className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalMembers}</p>
                <p className="text-xs text-muted-foreground">Membres cercle</p>
              </div>
            </div>
          </Card>

          <Card className="pastel-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-mint flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.activeToday}</p>
                <p className="text-xs text-muted-foreground">Actives auj.</p>
              </div>
            </div>
          </Card>

          <Card className="pastel-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-sky flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-sky-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalPagesThisWeek}</p>
                <p className="text-xs text-muted-foreground">Pages/sem.</p>
              </div>
            </div>
          </Card>

          <Card className="pastel-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-peach flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-peach-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.behindCount}</p>
                <p className="text-xs text-muted-foreground">En retard</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Members List */}
        <div className="space-y-3">
          <h2 className="font-display text-lg text-foreground">Membres du Cercle</h2>
          
          {loadingData ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <Card className="pastel-card p-6 text-center">
              <p className="text-muted-foreground">Aucun membre inscrit</p>
            </Card>
          ) : (
            members.map((member, index) => (
              <motion.div
                key={member.user_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`pastel-card p-4 flex items-center justify-between ${
                  member.is_behind ? 'border-l-4 border-l-destructive' : ''
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      member.is_behind ? 'bg-destructive/10' : 'bg-success/10'
                    }`}>
                      {member.is_behind ? (
                        <X className="h-5 w-5 text-destructive" />
                      ) : (
                        <Check className="h-5 w-5 text-success" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.last_read_date 
                          ? `Dernière lecture: ${format(parseISO(member.last_read_date), 'dd MMM', { locale: fr })}`
                          : 'Pas encore de lecture'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{member.total_pages}</p>
                    <p className="text-xs text-muted-foreground">pages/sem.</p>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
