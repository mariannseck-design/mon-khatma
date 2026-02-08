import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Send, Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

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
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const { isRecording, recordingTime, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  const handleVoiceRecord = async () => {
    if (isRecording) {
      // Stop and send
      setIsUploadingVoice(true);
      try {
        const blob = await stopRecording();
        if (!blob || !user) {
          setIsUploadingVoice(false);
          return;
        }

        // Upload to storage
        const fileName = `${user.id}/${Date.now()}.webm`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('voice-messages')
          .upload(fileName, blob, {
            contentType: 'audio/webm',
          });

        if (uploadError) {
          toast.error('Erreur lors de l\'envoi du message vocal');
          setIsUploadingVoice(false);
          return;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('voice-messages')
          .getPublicUrl(fileName);

        // Insert message
        const { error } = await supabase
          .from('circle_messages')
          .insert({
            circle_id: circleId,
            user_id: user.id,
            section,
            content: '🎤 Message vocal',
            is_voice: true,
            voice_url: urlData.publicUrl,
          });

        if (error) {
          toast.error('Erreur lors de l\'envoi du message vocal');
        } else {
          toast.success('Message vocal envoyé! 🎤');
          setIsOpen(false);
          onMessageSent();
        }
      } catch (error) {
        toast.error('Erreur d\'accès au microphone');
      }
      setIsUploadingVoice(false);
    } else {
      // Start recording
      try {
        await startRecording();
      } catch (error) {
        toast.error('Impossible d\'accéder au microphone. Vérifie les permissions.');
      }
    }
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

            {isRecording ? (
              <div className="flex items-center justify-center gap-4 py-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-foreground">
                    {formatTime(recordingTime)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelRecording}
                  className="rounded-full"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleVoiceRecord}
                  disabled={isUploadingVoice}
                  className="rounded-full bg-primary text-primary-foreground gap-2"
                  size="sm"
                >
                  {isUploadingVoice ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  Envoyer
                </Button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Partage un rappel, une invocation ou un encouragement..."
                    className="min-h-[100px] rounded-2xl border-muted resize-none font-light pr-12"
                    maxLength={500}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleVoiceRecord}
                    className="absolute right-2 bottom-2 h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
                    title="Enregistrer un message vocal"
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                </div>

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
              </>
            )}
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
