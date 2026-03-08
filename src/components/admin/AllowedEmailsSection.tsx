import { useState, useEffect } from 'react';
import { Plus, Trash2, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AllowedEmail {
  id: string;
  email: string;
  label: string | null;
  created_at: string;
}

export function AllowedEmailsSection() {
  const [emails, setEmails] = useState<AllowedEmail[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    const { data, error } = await supabase
      .from('allowed_emails')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setEmails(data);
    if (error) console.error('Error fetching allowed emails:', error);
  };

  const addEmail = async () => {
    if (!newEmail.trim()) return;
    setLoading(true);
    
    const { error } = await supabase
      .from('allowed_emails')
      .insert({ email: newEmail.trim().toLowerCase(), label: newLabel.trim() || null });
    
    if (error) {
      if (error.code === '23505') {
        toast.error('Cet email est déjà dans la liste');
      } else {
        toast.error('Erreur lors de l\'ajout');
      }
    } else {
      toast.success('Email ajouté ✅');
      setNewEmail('');
      setNewLabel('');
      fetchEmails();
    }
    setLoading(false);
  };

  const removeEmail = async (id: string) => {
    const { error } = await supabase
      .from('allowed_emails')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Email retiré');
      setEmails(prev => prev.filter(e => e.id !== id));
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg text-foreground flex items-center gap-2">
        <Mail className="h-5 w-5" /> Emails autorisés
      </h2>
      <p className="text-xs text-muted-foreground">
        Ces utilisatrices ont accès à toutes les fonctionnalités (sans être admin).
      </p>

      {/* Add form */}
      <Card className="pastel-card p-4 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="email@exemple.com"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            type="email"
            className="flex-1"
          />
          <Input
            placeholder="Nom (optionnel)"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            className="w-32"
          />
        </div>
        <Button 
          onClick={addEmail} 
          disabled={loading || !newEmail.trim()}
          size="sm"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-1" /> Ajouter
        </Button>
      </Card>

      {/* List */}
      {emails.length === 0 ? (
        <Card className="pastel-card p-4 text-center">
          <p className="text-muted-foreground text-sm">Aucun email autorisé</p>
        </Card>
      ) : (
        emails.map(entry => (
          <Card key={entry.id} className="pastel-card p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{entry.email}</p>
              {entry.label && (
                <p className="text-xs text-muted-foreground">{entry.label}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeEmail(entry.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        ))
      )}
    </div>
  );
}
