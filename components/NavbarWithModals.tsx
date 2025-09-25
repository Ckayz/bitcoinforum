'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, Bitcoin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ProfileModal } from './modals/ProfileModal';
import { SettingsModal } from './modals/SettingsModal';
import { HelpModal } from './modals/HelpModal';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [helpModal, setHelpModal] = useState(false);
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const openModal = (modal: 'profile' | 'settings' | 'help') => {
    setIsOpen(false);
    switch (modal) {
      case 'profile':
        setProfileModal(true);
        break;
      case 'settings':
        setSettingsModal(true);
        break;
      case 'help':
        setHelpModal(true);
        break;
    }
  };

  return (
    <>
      <nav className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Bitcoin className="h-8 w-8 text-orange-500" />
                <span className="font-bold text-xl text-white">Bitcoin Forum</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-300 hover:text-orange-500 transition-colors">
                Home
              </Link>
              <Link href="/news" className="text-gray-300 hover:text-orange-500 transition-colors">
                News
              </Link>
            </div>

            {/* Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 w-20 bg-zinc-800 rounded"></div>
                </div>
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-orange-500 text-white">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.email?.split('@')[0]}</span>
                  </button>

                  {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-md shadow-lg py-1 z-50 border border-zinc-700">
                      <button
                        onClick={() => openModal('profile')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700 hover:text-white"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => openModal('settings')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700 hover:text-white"
                      >
                        Settings
                      </button>
                      <button
                        onClick={() => openModal('help')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700 hover:text-white"
                      >
                        Help
                      </button>
                      <div className="border-t border-zinc-700 my-1"></div>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700 hover:text-white"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/auth">
                    <Button variant="outline" className="border-zinc-700 text-gray-300 hover:bg-zinc-800">
                      Login
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-300 hover:text-white focus:outline-none"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-zinc-800 border-t border-zinc-700">
              <Link
                href="/"
                className="text-gray-300 hover:text-orange-500 block px-3 py-2 text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/news"
                className="text-gray-300 hover:text-orange-500 block px-3 py-2 text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                News
              </Link>
              
              {user && (
                <div className="border-t border-zinc-700 pt-4">
                  <button
                    onClick={() => openModal('profile')}
                    className="text-gray-300 hover:text-orange-500 block px-3 py-2 text-base font-medium w-full text-left"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => openModal('settings')}
                    className="text-gray-300 hover:text-orange-500 block px-3 py-2 text-base font-medium w-full text-left"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => openModal('help')}
                    className="text-gray-300 hover:text-orange-500 block px-3 py-2 text-base font-medium w-full text-left"
                  >
                    Help
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-300 hover:text-orange-500 block px-3 py-2 text-base font-medium w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Modals */}
      <ProfileModal isOpen={profileModal} onClose={() => setProfileModal(false)} />
      <SettingsModal isOpen={settingsModal} onClose={() => setSettingsModal(false)} />
      <HelpModal isOpen={helpModal} onClose={() => setHelpModal(false)} />
    </>
  );
}
