'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit3, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RichTextEditor } from './RichTextEditor';

interface PostEditProps {
  postId: string;
  initialContent: string;
  isAuthor: boolean;
  onUpdate: (newContent: string, editedAt: string) => void;
  isEditing: boolean;
  onEditToggle: (editing: boolean) => void;
}

export function PostEdit({ postId, initialContent, isAuthor, onUpdate, isEditing, onEditToggle }: PostEditProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  if (!isAuthor) return null;

  const handleEdit = () => {
    setContent(initialContent);
    onEditToggle(true);
  };

  const handleCancel = () => {
    setContent(initialContent);
    onEditToggle(false);
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({ content: content.trim() })
        .eq('id', postId);

      if (error) throw error;

      onUpdate(content.trim(), new Date().toISOString());
      onEditToggle(false);
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleEdit}
        className="text-gray-500 hover:text-orange-500 transition-colors"
      >
        <Edit3 className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Edit</span>
      </Button>
    );
  }

  // Return the editing interface that replaces the content area
  return (
    <div className="space-y-4">
      {/* Rich Text Editor */}
      <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-1">
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Edit your post..."
          className="min-h-[150px] border-0"
        />
      </div>

      {/* Save/Cancel Actions */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          <Edit3 className="h-3 w-3 inline mr-1" />
          Editing mode
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={saving}
            className="border-zinc-600 text-gray-300 hover:bg-zinc-700"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !content.trim() || content === initialContent}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
