'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Bold, Italic, Code, Link, List, Quote, AtSign } from 'lucide-react';
import { Markdown } from './Markdown';
import { MentionInput } from './MentionInput';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = "Write your message...", 
  className = "",
  minHeight = "min-h-[150px]"
}: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown('**', '**'), tooltip: 'Bold' },
    { icon: Italic, action: () => insertMarkdown('*', '*'), tooltip: 'Italic' },
    { icon: Code, action: () => insertMarkdown('`', '`'), tooltip: 'Inline Code' },
    { icon: Link, action: () => insertMarkdown('[', '](url)'), tooltip: 'Link' },
    { icon: List, action: () => insertMarkdown('- '), tooltip: 'List' },
    { icon: Quote, action: () => insertMarkdown('> '), tooltip: 'Quote' },
    { icon: AtSign, action: () => insertMarkdown('@'), tooltip: 'Mention User' },
  ];

  return (
    <div className={`border border-zinc-700 rounded-lg bg-zinc-800 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-700">
        <div className="flex items-center space-x-2">
          {toolbarButtons.map((button, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={button.action}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-zinc-700"
              title={button.tooltip}
            >
              <button.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={!isPreview ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsPreview(false)}
            className="h-8 text-xs"
          >
            <Edit className="h-3 w-3 mr-1" />
            Write
          </Button>
          <Button
            variant={isPreview ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsPreview(true)}
            className="h-8 text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3">
        {isPreview ? (
          <div className={`${minHeight} overflow-y-auto`}>
            {value.trim() ? (
              <Markdown content={value} />
            ) : (
              <p className="text-gray-500 italic">Nothing to preview...</p>
            )}
          </div>
        ) : (
          <MentionInput
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`bg-transparent border-0 focus:ring-0 text-white resize-none w-full ${minHeight}`}
          />
        )}
      </div>

      {/* Help Text */}
      {!isPreview && (
        <div className="px-3 pb-3">
          <p className="text-xs text-gray-500">
            Supports **bold**, *italic*, `code`, [links](url), lists, and more markdown formatting
          </p>
        </div>
      )}
    </div>
  );
}
