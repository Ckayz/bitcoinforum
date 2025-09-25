'use client';

import { useState } from 'react';
import { Modal } from '../Modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Copy, Check, Link2, Twitter, Facebook, MessageCircle } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export function ShareModal({ isOpen, onClose, url, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareOptions = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: 'hover:bg-blue-500/10 hover:text-blue-500'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'hover:bg-blue-600/10 hover:text-blue-600'
    },
    {
      name: 'Telegram',
      icon: MessageCircle,
      url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: 'hover:bg-blue-400/10 hover:text-blue-400'
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Post" size="sm">
      <div className="p-6 space-y-6">
        {/* URL Copy Section */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Copy Link
          </label>
          <div className="flex space-x-2">
            <Input
              value={url}
              readOnly
              className="bg-zinc-800 border-zinc-700 text-white text-sm"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="border-zinc-700 text-gray-300 hover:bg-zinc-800 px-3"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          {copied && (
            <p className="text-green-500 text-xs mt-1">Copied to clipboard!</p>
          )}
        </div>

        {/* Share Options */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Share on Social Media
          </label>
          <div className="grid grid-cols-1 gap-2">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.name}
                  onClick={() => window.open(option.url, '_blank', 'width=600,height=400')}
                  className={`flex items-center space-x-3 p-3 rounded-lg border border-zinc-700 text-gray-300 transition-colors ${option.color}`}
                >
                  <Icon className="h-5 w-5" />
                  <span>Share on {option.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Copy Button */}
        <div className="border-t border-zinc-800 pt-4">
          <Button
            onClick={copyToClipboard}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Link2 className="h-4 w-4 mr-2" />
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
