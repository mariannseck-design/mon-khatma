import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ProfilPage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data?.display_name) setDisplayName(data.display_name);
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('user_id', user.id);
    setLoading(false);
    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le profil.', variant: 'destructive' });
    } else {
      toast({ title: 'Profil mis à jour ✨', description: 'Ton nom a été enregistré.' });
    }
  };

  const getInitials = () => {
    if (displayName) return displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <AppLayout title="Mon Profil">
      <div className="space-y-6 pb-6">
        <div className="flex flex-col items-center pt-4">
          <Avatar className="h-20 w-20 border-4 border-primary/20 mb-4">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email
              </Label>
              <Input id="email" value={user?.email || ''} disabled className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Nom affiché</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ton prénom ou surnom"
                className="rounded-xl"
              />
            </div>
            <Button onClick={handleSave} disabled={loading} className="w-full rounded-xl">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
