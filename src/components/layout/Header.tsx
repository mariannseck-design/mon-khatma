import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Settings, LogOut, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export function Header({ title = "Mon Compagnon" }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [notifications] = useState(2);

  const getInitials = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
      <div className="container max-w-lg mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-spiritual flex items-center justify-center shadow-lg">
                <Moon className="h-5 w-5 text-primary-foreground" />
              </div>
              <motion.div
                className="absolute -inset-1 rounded-xl bg-primary/20"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-foreground">
                {title}
              </h1>
              <p className="text-xs text-muted-foreground">de Constance</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-medium">
                  {notifications}
                </span>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={signOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
