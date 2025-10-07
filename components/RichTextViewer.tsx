'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

interface RichTextViewerProps {
  content: string;
  className?: string;
}

export function RichTextViewer({ content, className }: RichTextViewerProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-zinc-800 text-gray-300 p-4 rounded-lg overflow-x-auto my-4 border border-zinc-700',
          },
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-orange-500 hover:text-orange-400 underline',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `prose prose-invert max-w-none ${className}`,
      },
    },
  });

  if (!editor) {
    return <div className="animate-pulse bg-zinc-800 h-20 rounded" />;
  }

  return (
    <div className="rich-text-content">
      <EditorContent editor={editor} />
      <style jsx global>{`
        .rich-text-content .ProseMirror {
          outline: none;
        }
        
        .rich-text-content .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin: 1.5rem 0 1rem 0;
          color: white;
        }
        
        .rich-text-content .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.25rem 0 0.75rem 0;
          color: white;
        }
        
        .rich-text-content .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          color: white;
        }
        
        .rich-text-content .ProseMirror p {
          margin: 0.75rem 0;
          line-height: 1.6;
          color: #d1d5db;
        }
        
        .rich-text-content .ProseMirror ul,
        .rich-text-content .ProseMirror ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
          color: #d1d5db;
        }
        
        .rich-text-content .ProseMirror li {
          margin: 0.25rem 0;
        }
        
        .rich-text-content .ProseMirror blockquote {
          border-left: 4px solid #f97316;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #9ca3af;
          background: rgba(249, 115, 22, 0.1);
          padding: 1rem;
          border-radius: 0.5rem;
        }
        
        .rich-text-content .ProseMirror code {
          background: #374151;
          color: #f9fafb;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        
        .rich-text-content .ProseMirror strong {
          font-weight: 700;
          color: white;
        }
        
        .rich-text-content .ProseMirror em {
          font-style: italic;
        }
        
        .rich-text-content .ProseMirror s {
          text-decoration: line-through;
        }
      `}</style>
    </div>
  );
}
