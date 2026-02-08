import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface NewMessageFormProps {
  circleId: string;
  section: 'inspirations' | 'entraide' | 'rappels';
  onMessageSent: () => void;
}

export function NewMessageForm({ circleId, section, onMessageSent }: NewMessageFormProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !content.trim()) return;

    setIsSubmitting(true);

    const { error } = await supabase
      .from('circle_messages')
      .insert({
        circle_id: circleId,
        user_id: user.id,
        section,
        content: content.trim(),
      });

    if (error) {
      toast.error('Erreur lors de l\'envoi du message');
    } else {
      toast.success('Message envoyé! ✨');
      setContent('');
      setIsOpen(false);
      onMessageSent();
    }

    setIsSubmitting(false);
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-card rounded-3xl border shadow-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm text-foreground">
                Nouveau message
              </h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Partage un rappel, une invocation ou un encouragement..."
              className="min-h-[100px] rounded-2xl border-muted resize-none font-light"
              maxLength={500}
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {content.length}/500 caractères
              </span>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className="rounded-full bg-primary text-primary-foreground gap-2"
                size="sm"
              >
                <Send className="h-4 w-4" />
                Envoyer
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="rounded-full bg-primary text-primary-foreground shadow-lg hover-lift gap-2"
            >
              <Plus className="h-5 w-5" />
              Partager un message
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
