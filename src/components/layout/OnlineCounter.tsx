import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useOnlinePresence } from '@/hooks/useOnlinePresence';

export function OnlineCounter() {
  const { onlineCount } = useOnlinePresence();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 bg-success/20 text-success-foreground px-3 py-1.5 rounded-full"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
      </span>
      <Users className="h-4 w-4 text-muted-foreground" />
      <motion.span
        key={onlineCount}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-sm font-medium text-foreground"
      >
        {onlineCount} {onlineCount > 1 ? 'en ligne' : 'en ligne'}
      </motion.span>
    </motion.div>
  );
}
