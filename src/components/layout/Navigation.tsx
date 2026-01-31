import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  BookOpen, 
  CheckSquare, 
  PenTool, 
  Award,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/hifz', icon: BookOpen, label: 'Hifz' },
  { path: '/trackers', icon: CheckSquare, label: 'Trackers' },
  { path: '/journal', icon: PenTool, label: 'Journal' },
  { path: '/rewards', icon: Award, label: 'Rewards' },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border">
      <div className="container max-w-lg mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center py-2 px-3 group"
              >
                <div className={cn(
                  "relative p-2 rounded-xl transition-all duration-300",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-primary rounded-xl"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Icon className={cn("h-5 w-5 relative z-10", isActive && "text-primary-foreground")} />
                </div>
                <span className={cn(
                  "text-xs mt-1 font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
      
      {/* Ramadan mode indicator */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-1 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium shadow-lg">
          <Moon className="h-3 w-3" />
          <span>Ramadan</span>
        </div>
      </div>
    </nav>
  );
}
