import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Heart, 
  BookOpen, 
  Smile, 
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/accueil', icon: Home, label: 'Accueil' },
  { path: '/favoris', icon: Heart, label: 'Favoris' },
  { path: '/recits', icon: BookOpen, label: 'Récits' },
  { path: '/emotions', icon: Smile, label: 'Émotions' },
  { path: '/rappels', icon: Bell, label: 'Rappels' },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50">
      <div className="container max-w-lg mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center py-1 px-3 group"
              >
                <div className={cn(
                  "relative p-2.5 rounded-2xl transition-all duration-300",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
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
                    "h-5 w-5 relative z-10 transition-colors",
                    isActive && "text-primary-foreground"
                  )} />
                </div>
                <span className={cn(
                  "text-[10px] mt-1 font-medium transition-colors",
                  isActive ? "text-primary-foreground" : "text-muted-foreground"
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
