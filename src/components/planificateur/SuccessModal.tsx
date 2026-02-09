import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center border-none shadow-xl bg-gradient-to-br from-card via-card to-accent/10">
        <DialogHeader className="space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="mx-auto text-5xl"
          >
            🌟
          </motion.div>
          <DialogTitle className="text-xl font-display text-center">
            Félicitations pour votre constance
          </DialogTitle>
          <DialogDescription className="text-base text-center leading-relaxed px-2">
            Qu'Allah <span className="honorific">(عز وجل)</span> accepte votre lecture et illumine votre cœur. 
            Vous avez franchi une étape de plus vers la constance.
          </DialogDescription>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <Button 
            onClick={onClose} 
            className="w-full bg-gradient-mint text-primary-foreground hover:opacity-90"
          >
            Alhamdulillah 🤲
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
