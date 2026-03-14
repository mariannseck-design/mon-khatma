import { useState, useEffect } from 'react';
import { Mail, CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EmailStats {
  total: number;
  sent: number;
  pending: number;
  failed: number;
  rate_limited: number;
}

interface EmailLogEntry {
  id: string;
  message_id: string | null;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  sent: { label: 'Envoyé', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  failed: { label: 'Échoué', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
  dlq: { label: 'Échoué', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
  rate_limited: { label: 'Rate limit', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Clock },
};

export function EmailMonitoringSection() {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [recent, setRecent] = useState<EmailLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysBack, setDaysBack] = useState(7);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_admin_email_stats', {
      days_back: daysBack,
    });
    if (!error && data) {
      setStats((data as any).stats);
      setRecent((data as any).recent || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [daysBack]);

  const statCards = stats
    ? [
        { label: 'Total', value: stats.total, icon: Mail, gradient: 'bg-gradient-lavender' },
        { label: 'Envoyés', value: stats.sent, icon: CheckCircle, gradient: 'bg-gradient-mint' },
        { label: 'En attente', value: stats.pending, icon: Clock, gradient: 'bg-gradient-sky' },
        { label: 'Échoués', value: stats.failed, icon: AlertTriangle, gradient: 'bg-gradient-peach' },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-foreground flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Suivi des Emails
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={daysBack}
            onChange={(e) => setDaysBack(Number(e.target.value))}
            className="text-xs rounded-lg border border-border bg-background px-2 py-1"
          >
            <option value={1}>24h</option>
            <option value={7}>7 jours</option>
            <option value={30}>30 jours</option>
          </select>
          <Button variant="ghost" size="icon" onClick={fetchData} disabled={loading} className="h-8 w-8">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading && !stats ? (
        <div className="flex items-center justify-center h-20">
          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-2">
            {statCards.map(({ label, value, icon: Icon, gradient }) => (
              <Card key={label} className="pastel-card p-3 text-center">
                <div className={`w-8 h-8 rounded-lg ${gradient} flex items-center justify-center mx-auto mb-1`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <p className="text-lg font-bold text-foreground">{value}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </Card>
            ))}
          </div>

          {/* Recent emails table */}
          {recent.length === 0 ? (
            <Card className="pastel-card p-6 text-center">
              <p className="text-sm text-muted-foreground">Aucun email sur cette période</p>
            </Card>
          ) : (
            <Card className="pastel-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left p-2 font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-2 font-medium text-muted-foreground">Destinataire</th>
                      <th className="text-left p-2 font-medium text-muted-foreground">Statut</th>
                      <th className="text-left p-2 font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((entry) => {
                      const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending;
                      return (
                        <tr key={entry.id} className="border-b border-border/30 last:border-0">
                          <td className="p-2">
                            <span className="font-medium text-foreground">{entry.template_name}</span>
                          </td>
                          <td className="p-2 text-muted-foreground max-w-[140px] truncate">
                            {entry.recipient_email}
                          </td>
                          <td className="p-2">
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cfg.color}`}>
                              {cfg.label}
                            </Badge>
                          </td>
                          <td className="p-2 text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: fr })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {recent.some((e) => e.error_message) && (
                <div className="border-t border-border/50 p-3 space-y-1">
                  <p className="text-[10px] font-medium text-destructive">Dernières erreurs :</p>
                  {recent
                    .filter((e) => e.error_message)
                    .slice(0, 3)
                    .map((e) => (
                      <p key={e.id} className="text-[10px] text-muted-foreground truncate">
                        {e.template_name}: {e.error_message}
                      </p>
                    ))}
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
