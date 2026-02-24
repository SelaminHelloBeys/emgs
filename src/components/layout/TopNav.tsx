import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { roleLabels } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { 
  Menu, 
  Bell, 
  Search, 
  LogOut,
  User,
  Settings,
  ChevronDown,
  Loader2,
  Video,
  FileText,
  Target,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TopNavProps {
  onMenuClick: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onMenuClick }) => {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const { results, isSearching, search, clearResults } = useGlobalSearch();
  const { unreadCount } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        search(searchQuery);
        setShowSearchResults(true);
      } else {
        clearResults();
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, search, clearResults]);

  // Close search results on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleResultClick = (url: string) => {
    navigate(url);
    setSearchQuery('');
    setShowSearchResults(false);
    clearResults();
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return <Video className="w-4 h-4 text-blue-500" />;
      case 'exam':
        return <Target className="w-4 h-4 text-purple-500" />;
      case 'homework':
        return <FileText className="w-4 h-4 text-orange-500" />;
      case 'user':
        return <User className="w-4 h-4 text-green-500" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  return (
    <header className="h-16 bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">E</span>
            </div>
            <span className="font-semibold text-lg hidden sm:block">EMG</span>
          </div>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8" ref={searchRef}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Ders, video, sınav ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-10 rounded-xl bg-surface-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  clearResults();
                  setShowSearchResults(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <Card className="absolute top-full left-0 right-0 mt-2 max-h-80 overflow-auto z-50">
                {isSearching ? (
                  <div className="p-4 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Sonuç bulunamadı
                  </div>
                ) : (
                  <div className="divide-y">
                    {results.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        className="w-full p-3 text-left hover:bg-surface-secondary flex items-center gap-3 transition-colors"
                        onClick={() => handleResultClick(result.url)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          {getResultIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{result.title}</p>
                          <p className="text-xs text-muted-foreground">{result.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground capitalize">
                          {result.type === 'lesson' ? 'Ders' :
                           result.type === 'exam' ? 'Sınav' :
                           result.type === 'homework' ? 'Ödev' : 'Kullanıcı'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <ThemeToggle />
          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-apple-red text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 w-80">
              <NotificationPanel />
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2 pr-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium">{profile?.name || user?.email}</span>
                  <span className="text-xs text-muted-foreground">
                    {role && roleLabels[role]}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{profile?.name || 'Kullanıcı'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Ayarlar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-apple-red">
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
