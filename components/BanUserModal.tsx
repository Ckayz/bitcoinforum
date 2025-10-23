'use client';

import { useState } from 'react';
import { Ban, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface BanUserModalProps {
  userId: string;
  username: string;
  trigger?: React.ReactNode;
}

export function BanUserModal({ userId, username, trigger }: BanUserModalProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [banType, setBanType] = useState<'temporary' | 'permanent'>('temporary');
  const [duration, setDuration] = useState('7'); // days
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const executeBan = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      const banData: any = {
        user_id: userId,
        banned_by: user.id,
        ban_type: banType,
        reason: reason.trim()
      };

      if (banType === 'temporary') {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(duration));
        banData.expires_at = expiresAt.toISOString();
      }

      const { error } = await supabase
        .from('user_bans')
        .insert([banData]);

      if (error) throw error;

      // Log moderation action
      await supabase.from('moderation_actions').insert([{
        moderator_id: user.id,
        action_type: 'ban_user',
        target_type: 'user',
        target_id: userId,
        reason: reason.trim()
      }]);

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setBanType('temporary');
        setDuration('7');
        setReason('');
      }, 2000);
    } catch (error) {
      console.error('Error banning user:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBanUser = () => {
    if (!user || !reason.trim()) return;

    if (!confirm(`Are you sure you want to ${banType === 'permanent' ? 'permanently' : 'temporarily'} ban ${username}? This is a serious moderation action.`)) {
      return;
    }

    executeBan();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="border-red-500 text-red-400 hover:bg-red-500/10">
            <Ban className="h-4 w-4 mr-1" />
            Ban User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Ban User: {username}</span>
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ban className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-red-400 font-medium">User banned successfully</p>
            <p className="text-gray-400 text-sm mt-1">
              {banType === 'permanent' ? 'Permanent ban applied' : `Banned for ${duration} days`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ban Type *
              </label>
              <Select value={banType} onValueChange={(value: 'temporary' | 'permanent') => setBanType(value)}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="temporary" className="text-white">Temporary Ban</SelectItem>
                  <SelectItem value="permanent" className="text-white">Permanent Ban</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {banType === 'temporary' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (days) *
                </label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="1" className="text-white">1 day</SelectItem>
                    <SelectItem value="3" className="text-white">3 days</SelectItem>
                    <SelectItem value="7" className="text-white">7 days</SelectItem>
                    <SelectItem value="14" className="text-white">14 days</SelectItem>
                    <SelectItem value="30" className="text-white">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason for ban *
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this user is being banned..."
                className="bg-zinc-800 border-zinc-700 text-white resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{reason.length}/500 characters</p>
            </div>

            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">
                <strong>Warning:</strong> This action will prevent the user from accessing the forum. 
                Make sure you have sufficient reason for this action.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-zinc-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBanUser}
                disabled={!reason.trim() || submitting}
                className="bg-red-500 hover:bg-red-600"
              >
                {submitting ? 'Banning...' : `${banType === 'permanent' ? 'Permanently ' : ''}Ban User`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
