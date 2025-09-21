'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, Bitcoin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
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
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 w-20 bg-zinc-800 rounded"></div>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-orange-500 text-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-300 text-sm">{user.email}</span>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-x-2">
                <Link href="/auth/login">
                  <Button 
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-zinc-800">
              <Link 
                href="/" 
                className="text-gray-300 hover:text-orange-500 block px-3 py-2 text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              
              <div className="border-t border-zinc-800 pt-4">
                {loading ? (
                  <div className="animate-pulse px-3 py-2">
                    <div className="h-4 bg-zinc-800 rounded w-24"></div>
                  </div>
                ) : user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-gray-300 text-sm">{user.email}</div>
                    <Button 
                      variant="outline" 
                      onClick={handleSignOut}
                      className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <Button 
                        variant="outline"
                        className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}