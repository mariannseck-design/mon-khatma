import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SectionCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  onClick: () => void;
  index: number;
}

export function SectionCard({ 
  title, 
  description, 
  icon: Icon, 
  gradient, 
  iconBg, 
  onClick, 
  index 
}: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card 
        className={`${gradient} p-5 cursor-pointer hover-lift active:scale-[0.98] transition-all`}
        onClick={onClick}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-foreground/80" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
