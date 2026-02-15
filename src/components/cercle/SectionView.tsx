import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { NewMessageForm } from './NewMessageForm';
import { CollectiveCounter } from './CollectiveCounter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  is_liked_by_user: boolean;
  is_voice?: boolean;
  voice_url?: string;
  author_name?: string;
}

interface SectionViewProps {
  circleId: string;
  section: 'inspirations' | 'entraide' | 'rappels';
  title: string;
  onBack: () => void;
}

const sectionDescriptions = {
  inspirations: 'Partage de versets et réflexions spirituelles',
  entraide: 'Questions et échanges entre membres',
  rappels: 'Messages d\'encouragement et invocations',
};

const bubbleVariants: ('beige' | 'rose' | 'mint')[] = ['beige', 'rose', 'mint'];

export function SectionView({ circleId, section, title, onBack }: SectionViewProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    if (!user) return;

    // Fetch messages with likes count
    const { data: messagesData, error } = await supabase
      .from('circle_messages')
      .select('*')
      .eq('circle_id', circleId)
      .eq('section', section)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !messagesData) {
      setLoading(false);
      return;
    }

    // Fetch likes for these messages
    const messageIds = messagesData.map(m => m.id);
    
    const { data: likesData } = await supabase
      .from('circle_message_likes')
      .select('message_id, user_id')
      .in('message_id', messageIds);

    // Get user profiles for display names
    const userIds = [...new Set(messagesData.map(m => m.user_id))];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', userIds);

    const profilesMap = new Map(profilesData?.map(p => [p.user_id, p.display_name]) || []);

    // Combine data
    const enrichedMessages = messagesData.map(msg => {
      const msgLikes = likesData?.filter(l => l.message_id === msg.id) || [];
      return {
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        user_id: msg.user_id,
        likes_count: msgLikes.length,
        is_liked_by_user: msgLikes.some(l => l.user_id === user.id),
        is_voice: msg.is_voice || false,
        voice_url: msg.voice_url || undefined,
        author_name: profilesMap.get(msg.user_id) || undefined,
      };
    });

    setMessages(enrichedMessages);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`circle-${section}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'circle_messages',
          filter: `section=eq.${section}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [circleId, section, user]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="font-display text-xl text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{sectionDescriptions[section]}</p>
        </div>
      </motion.div>

      {/* Collective counter for rappels section */}
      {section === 'rappels' && <CollectiveCounter />}

      {/* New message form */}
      <NewMessageForm
        circleId={circleId}
        section={section}
        onMessageSent={fetchMessages}
      />

      {/* Messages list */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-3 pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">Aucun message pour le moment</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Sois la première à partager! ✨
              </p>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                id={message.id}
                content={message.content}
                createdAt={message.created_at}
                authorName={message.author_name}
                likesCount={message.likes_count}
                isLikedByUser={message.is_liked_by_user}
                isVoice={message.is_voice}
                voiceUrl={message.voice_url}
                variant={bubbleVariants[index % bubbleVariants.length]}
                onLikeChange={fetchMessages}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
