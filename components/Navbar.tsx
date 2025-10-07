'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Bitcoin, Search, Shield, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import { ProfileModal } from './modals/ProfileModal';
import { SettingsModal } from './modals/SettingsModal';
import { HelpModal } from './modals/HelpModal';
import { BitcoinPriceTicker } from './BitcoinPriceTicker';
import { supabase } from '@/lib/supabase';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [helpModal, setHelpModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { suggestions, loading: searchLoading } = useSearchSuggestions(searchQuery);

  useEffect(() => {
    if (user) {
      fetchUserAvatar();
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, showSearchDropdown]);

  const fetchUserAvatar = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('users')
        .select('avatar_url, username, role, is_moderator')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setAvatarUrl(data.avatar_url);
        setUsername(data.username);
        // Set userRole to 'verified' if user is verified OR is_moderator is true
        if (data.role === 'verified' || data.is_moderator) {
          setUserRole('verified');
        } else {
          setUserRole(data.role);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    router.push(`/thread/${suggestion.id}`);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left Section - Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-orange-500 hover:text-orange-400 transition-colors">
              <Bitcoin className="h-8 w-8" />
              <span className="text-xl font-bold hidden sm:block">BitcoinForum</span>
            </Link>
          </div>

          {/* Center Section - Navigation & Search */}
          <div className="hidden lg:flex items-center space-x-8 flex-1 max-w-2xl mx-8">
            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-gray-300 hover:text-orange-400 transition-colors font-medium">
                Home
              </Link>
              <Link href="/news" className="text-gray-300 hover:text-orange-400 transition-colors font-medium">
                News
              </Link>
              {user && userRole === 'verified' && (
                <Link href="/moderation" className="text-gray-300 hover:text-orange-400 transition-colors font-medium flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>Moderation</span>
                </Link>
              )}
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(e.target.value.length > 0);
                  }}
                  className="pl-10 pr-4 bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-400 focus:border-orange-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </form>

              {/* Search Suggestions */}
              {showSearchDropdown && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-zinc-700 text-white text-sm border-b border-zinc-700 last:border-b-0"
                    >
                      <div className="font-medium truncate">{suggestion.title}</div>
                      <div className="text-gray-400 text-xs truncate">{suggestion.excerpt}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Section - User Actions */}
          <div className="flex items-center space-x-4">
            {/* Bitcoin Price Ticker */}
            <div className="hidden md:block">
              <BitcoinPriceTicker />
            </div>

            {/* User Menu */}
            {loading ? (
              <div className="w-8 h-8 bg-zinc-700 rounded-full animate-pulse"></div>
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <span className="hidden md:block font-medium">{username || 'User'}</span>
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg py-1 z-50">
                    <button
                      onClick={() => { setProfileModal(true); setIsOpen(false); }}
                      className="flex items-center space-x-2 w-full text-left px-4 py-2 text-gray-300 hover:bg-zinc-700 hover:text-white"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => { setSettingsModal(true); setIsOpen(false); }}
                      className="flex items-center space-x-2 w-full text-left px-4 py-2 text-gray-300 hover:bg-zinc-700 hover:text-white"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                    <div className="border-t border-zinc-700 my-1"></div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 w-full text-left px-4 py-2 text-red-400 hover:bg-zinc-700"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth">
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                    Join Now
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-gray-300 hover:text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-zinc-800 py-4">
            <div className="space-y-4">
              {/* Mobile Search */}
              <div className="px-2">
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Search discussions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </form>
              </div>

              {/* Mobile Navigation */}
              <div className="space-y-2">
                <Link
                  href="/"
                  className="block px-4 py-2 text-gray-300 hover:text-orange-400 hover:bg-zinc-800 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/news"
                  className="block px-4 py-2 text-gray-300 hover:text-orange-400 hover:bg-zinc-800 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  News
                </Link>
                {user && userRole === 'verified' && (
                  <Link
                    href="/moderation"
                    className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-orange-400 hover:bg-zinc-800 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Moderation</span>
                  </Link>
                )}
              </div>

              {/* Mobile Bitcoin Price */}
              <div className="px-4 md:hidden">
                <BitcoinPriceTicker />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProfileModal isOpen={profileModal} onClose={() => setProfileModal(false)} />
      <SettingsModal isOpen={settingsModal} onClose={() => setSettingsModal(false)} />
      <HelpModal isOpen={helpModal} onClose={() => setHelpModal(false)} />
    </nav>
  );
}
