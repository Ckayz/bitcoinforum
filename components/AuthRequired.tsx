'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Bitcoin } from 'lucide-react';
import Link from 'next/link';

interface AuthRequiredProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
}

export function AuthRequired({ isOpen, onClose, action }: AuthRequiredProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <div className="flex items-center space-x-2 mb-2">
            <Bitcoin className="h-6 w-6 text-orange-500" />
            <DialogTitle className="text-white">Join the Bitcoin Community</DialogTitle>
          </div>
          <DialogDescription className="text-gray-300">
            {action} to participate in Bitcoin discussions and connect with fellow Bitcoiners.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-3 mt-4">
          <Link href="/auth/signup" onClick={onClose}>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
              Create Account
            </Button>
          </Link>
          <Link href="/auth/login" onClick={onClose}>
            <Button 
              variant="outline" 
              className="w-full border-zinc-700 text-gray-300 hover:bg-zinc-800"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}