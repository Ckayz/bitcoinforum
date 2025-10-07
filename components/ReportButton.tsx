'use client';

import { useState } from 'react';
import { Flag, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface ReportButtonProps {
  contentType: 'thread' | 'post' | 'comment';
  contentId: string;
  reportedUserId: string;
  className?: string;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or repetitive content' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'off_topic', label: 'Off-topic discussion' },
  { value: 'other', label: 'Other (please specify)' }
];

export function ReportButton({ contentType, contentId, reportedUserId, className }: ReportButtonProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!user || !reason) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('reports')
        .insert([{
          reporter_id: user.id,
          reported_user_id: reportedUserId,
          content_type: contentType,
          content_id: contentId,
          reason,
          description: description.trim() || null
        }]);

      if (error) throw error;

      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setReason('');
        setDescription('');
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`text-gray-500 hover:text-red-500 transition-colors ${className}`}
        >
          <Flag className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Report Content</span>
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-500 text-xl">✓</span>
            </div>
            <p className="text-green-400 font-medium">Report submitted successfully</p>
            <p className="text-gray-400 text-sm mt-1">Our moderators will review this content</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason for reporting *
              </label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {REPORT_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value} className="text-white">
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional details (optional)
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide more context about why you're reporting this content..."
                className="bg-zinc-800 border-zinc-700 text-white resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
            </div>

            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-400 text-sm">
                <strong>Note:</strong> False reports may result in action against your account. 
                Only report content that violates our community guidelines.
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
                onClick={handleSubmit}
                disabled={!reason || submitting}
                className="bg-red-500 hover:bg-red-600"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
