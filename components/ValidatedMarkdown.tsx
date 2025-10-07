'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '@/lib/supabase';

interface ValidatedMarkdownProps {
  content: string;
  className?: string;
}

export function ValidatedMarkdown({ content, className = '' }: ValidatedMarkdownProps) {
  const [validUsernames, setValidUsernames] = useState<Set<string>>(new Set());
  const [processedContent, setProcessedContent] = useState(content);

  useEffect(() => {
    const validateMentions = async () => {
      // Extract all @mentions from content
      const mentions = content.match(/@(\w+)/g);
      if (!mentions || mentions.length === 0) {
        setProcessedContent(content);
        return;
      }

      // Get unique usernames (remove @ symbol)
      const usernameSet = new Set(mentions.map(mention => mention.substring(1)));
      const usernames = Array.from(usernameSet);

      try {
        // Check which usernames exist in database
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .in('username', usernames);

        if (!error && data) {
          const validUsers = new Set(data.map(user => user.username));
          setValidUsernames(validUsers);
        }
      } catch (error) {
        console.error('Error validating mentions:', error);
      }
    };

    validateMentions();
  }, [content]);

  const renderTextWithMentions = (text: string) => {
    if (typeof text !== 'string') return text;
    
    return text.split(/(@\w+)/).map((part, i) => {
      const mentionMatch = part.match(/^@(\w+)$/);
      if (mentionMatch) {
        const username = mentionMatch[1];
        // Only highlight if user exists in database
        if (validUsernames.has(username)) {
          return (
            <span 
              key={i} 
              className="text-orange-400 font-medium bg-orange-500/10 px-1 rounded cursor-pointer hover:bg-orange-500/20"
              title={`@${username}`}
            >
              @{username}
            </span>
          );
        }
      }
      return part;
    });
  };

  return (
    <div className={`prose prose-invert prose-orange max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold text-white mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-bold text-white mb-2">{children}</h3>,
          p: ({ children }) => (
            <p className="text-gray-200 mb-3 leading-relaxed">
              {typeof children === 'string' ? renderTextWithMentions(children) : children}
            </p>
          ),
          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-zinc-800 text-orange-400 px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            return (
              <code className="bg-zinc-900 text-gray-200 p-2 rounded block overflow-x-auto">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 overflow-x-auto mb-4">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-orange-500 pl-4 py-2 bg-zinc-900/50 rounded-r mb-4">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => <ul className="list-disc list-inside text-gray-200 mb-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside text-gray-200 mb-3 space-y-1">{children}</ol>,
          li: ({ children }) => (
            <li className="text-gray-200">
              {typeof children === 'string' ? renderTextWithMentions(children) : children}
            </li>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
