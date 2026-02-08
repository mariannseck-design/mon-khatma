import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MessageBubbleProps {
  id: string;
  content: string;
  createdAt: string;
  authorName?: string;
  likesCount: number;
  isLikedByUser: boolean;
  variant?: 'beige' | 'rose' | 'mint';
  onLikeChange?: () => void;
}

const variantStyles = {
  beige: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100',
  rose: 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-100',
  mint: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100',
};

export function MessageBubble({
  id,
  content,
  createdAt,
  authorName,
  likesCount,
  isLikedByUser,
  variant = 'beige',
  onLikeChange,
}: MessageBubbleProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(isLikedByUser);
  const [likes, setLikes] = useState(likesCount);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleLike = async () => {
    if (!user) {
      toast.error('Tu dois être connectée pour encourager');
      return;
    }

    setIsAnimating(true);
    
    if (isLiked) {
      // Remove like
      const { error } = await supabase
        .from('circle_message_likes')
        .delete()
        .eq('message_id', id)
        .eq('user_id', user.id);

      if (!error) {
        setIsLiked(false);
        setLikes(prev => Math.max(0, prev - 1));
      }
    } else {
      // Add like
      const { error } = await supabase
        .from('circle_message_likes')
        .insert({ message_id: id, user_id: user.id });

      if (!error) {
        setIsLiked(true);
        setLikes(prev => prev + 1);
      }
    }

    setTimeout(() => setIsAnimating(false), 300);
    onLikeChange?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border p-4 ${variantStyles[variant]} shadow-sm`}
    >
      {/* Author and time */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">
          {authorName || 'Une sœur'}
        </span>
        <span className="text-xs text-muted-foreground/70">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: fr })}
        </span>
      </div>

      {/* Content */}
      <p className="text-foreground font-light leading-relaxed mb-3">
        {content}
      </p>

      {/* Like button */}
      <div className="flex items-center justify-end gap-2">
        <motion.button
          onClick={toggleLike}
          className="flex items-center gap-1 group"
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={`h-5 w-5 transition-all ${
                isLiked 
                  ? 'fill-amber-400 text-amber-400' 
                  : 'text-amber-300 group-hover:text-amber-400'
              }`}
            />
          </motion.div>
          {likes > 0 && (
            <span className="text-xs text-amber-500 font-medium">
              {likes}
            </span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
