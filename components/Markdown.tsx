'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className = '' }: MarkdownProps) {
  return (
    <div className={`prose prose-invert prose-orange max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom styling for markdown elements
          h1: ({ children }) => <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold text-white mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-bold text-white mb-2">{children}</h3>,
          p: ({ children }) => (
            <p className="text-gray-200 mb-3 leading-relaxed">
              {typeof children === 'string' 
                ? children.split(/(@\w+)/).map((part, i) => 
                    part.match(/^@\w+$/) 
                      ? <span key={i} className="text-orange-400 font-medium bg-orange-500/10 px-1 rounded">{part}</span>
                      : part
                  )
                : children
              }
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
          li: ({ children }) => <li className="text-gray-200">{children}</li>,
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
