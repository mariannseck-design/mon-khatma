import { Link } from 'react-router-dom';
import { LogOut, User, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { OnlineCounter } from '@/components/layout/OnlineCounter';
import logo from '@/assets/logo.png';

interface HeaderProps {
  title?: string;
}
export function Header({
  title = "Ma Khatma"
}: HeaderProps) {
  const {
    user,
    signOut,
    isAdmin
  } = useAuth();
  const getInitials = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };
  return <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/30">
      <div className="container max-w-lg mx-auto px-5">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Ma Khatma" className="w-10 h-10 rounded-xl object-contain" />
            <div>
              <h1 className="font-display text-lg font-semibold text-foreground">
                {title}
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            </p>
            </div>
          </div>

          {/* Online Counter */}
          <OnlineCounter />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem asChild>
                <Link to="/profil" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profil
                </Link>
              </DropdownMenuItem>
              {isAdmin && <DropdownMenuItem asChild>
                  <Link to="/admin" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin Dashboard
                  </Link>
                </DropdownMenuItem>}
              <DropdownMenuItem asChild>
                <Link to="/parametres" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Paramètres
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>;
}