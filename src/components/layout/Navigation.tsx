import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Heart, 
  BookOpen, 
  Smile, 
  Bell,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems: { path: string; icon: typeof Home; label: string; glow?: boolean }[] = [
  { path: '/accueil', icon: Home, label: 'Accueil' },
  { path: '/ramadan', icon: Moon, label: 'Ramadan', glow: true },
  { path: '/favoris', icon: Heart, label: 'Favoris' },
  { path: '/emotions', icon: Smile, label: 'Émotions' },
  { path: '/rappels', icon: Bell, label: 'Rappels' },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/98 backdrop-blur-xl border-t border-border/30 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.08)]">
      <div className="container max-w-lg mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center py-2 px-3 group min-w-[64px]"
              >
                <div className={cn(
                  "relative p-3.5 rounded-2xl transition-all duration-300",
                  isActive 
                    ? "bg-primary shadow-lg shadow-primary/30" 
                    : "text-muted-foreground group-hover:text-foreground group-hover:bg-muted"
                )}>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-primary rounded-2xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className={cn(
                    "h-6 w-6 relative z-10 transition-colors",
                    isActive ? "text-primary-foreground" : 
                    item.glow ? "animate-moon-glow" :
                    "text-muted-foreground group-hover:text-foreground"
                  )} />
                </div>
                <span className={cn(
                  "text-xs mt-1.5 font-semibold transition-colors text-center",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
