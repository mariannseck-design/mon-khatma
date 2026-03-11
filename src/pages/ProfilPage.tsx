import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Save, Bell, ChevronRight, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { useDevMode } from '@/hooks/useDevMode';
import { useNavigate } from 'react-router-dom';

export default function ProfilPage() {
  const { user, isAdmin, hasFullAccess } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDevMode, toggleDevMode } = useDevMode();
  const navigate = useNavigate();

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

        <Card 
          className="rounded-2xl cursor-pointer hover-lift" 
          onClick={() => navigate('/rappels')}
        >
          <CardContent className="flex items-center justify-between pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Mes Rappels</p>
                <p className="text-xs text-muted-foreground">Gérer mes notifications</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        {hasFullAccess && (
          <Card className="rounded-2xl border-dashed border-yellow-500/30">
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="font-semibold text-sm">Mode Testeur (Dev)</p>
                <p className="text-xs text-muted-foreground">Bouton Skip sur les étapes Hifz</p>
              </div>
              <Switch checked={isDevMode} onCheckedChange={toggleDevMode} />
            </CardContent>
          </Card>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Te déconnecter ?</AlertDialogTitle>
              <AlertDialogDescription>
                Tu devras te reconnecter pour accéder à ton compte.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="rounded-xl bg-destructive hover:bg-destructive/90"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/');
                }}
              >
                Se déconnecter
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
