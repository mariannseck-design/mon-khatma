import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Moon, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChapeletIcon } from '@/components/icons/ChapeletIcon';

const navItems: { path: string; icon: React.FC<any>; label: string; glow?: boolean }[] = [
  { path: '/accueil', icon: Home, label: 'Accueil' },
  { path: '/ramadan', icon: Moon, label: 'Ramadan', glow: true },
  { path: '/emotions', icon: ChapeletIcon, label: 'Dhikr' },
  { path: '/profil', icon: User, label: 'Profil' },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border/20 shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.06)]">
      <div className="container max-w-lg mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center py-1.5 px-3 group min-w-[64px]"
              >
                <div className={cn(
                  "relative p-3 rounded-full transition-all duration-300",
                  isActive 
                    ? "shadow-lg" 
                    : "group-hover:bg-muted/60"
                )}>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-[hsl(158,80%,23%)] to-[hsl(160,85%,18%)]"
                      style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2), 0 4px 12px rgba(6,95,70,0.3)' }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon 
                    className={cn(
                      "h-5 w-5 relative z-10 transition-colors",
                      isActive ? "text-white" : 
                      item.glow ? "animate-moon-glow" :
                      "text-[var(--p-text-55)] group-hover:text-foreground"
                    )}
                    strokeWidth={1.5}
                  />
                </div>
                <span className={cn(
                  "text-[10px] mt-1 font-semibold tracking-wider transition-colors text-center",
                  isActive ? "text-foreground" : "text-[var(--p-text-55)] group-hover:text-foreground"
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
