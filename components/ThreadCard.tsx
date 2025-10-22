'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { UserBadge } from '@/components/UserBadge';
import { ValidatedMarkdown } from '@/components/ValidatedMarkdown';
import { ReactionButton } from '@/components/ReactionButton';
import { MentionInput } from '@/components/MentionInput';
import { getUsername, getUserRole } from '@/lib/supabase-utils';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  image_url?: string;
  is_anonymous?: boolean;
  users: { username: string; role?: string } | { username: string; role?: string }[] | null;
  comment_likes: { id: string }[];
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  image_url?: string;
  video_url?: string;
  is_anonymous?: boolean;
  users: { username: string; role?: string } | { username: string; role?: string }[] | null;
  likes: { id: string }[];
  comments: Comment[];
}

interface Thread {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
  category_id: string;
  users: { username: string; role?: string } | { username: string; role?: string }[] | null;
  posts: Post[];
}

interface ThreadCardProps {
  thread: Thread;
  user: any;
  expandedComments: Set<string>;
  newComment: { [key: string]: string };
  commenting: { [key: string]: boolean };
  onToggleComments: (postId: string) => void;
  onCommentChange: (postId: string, value: string) => void;
  onComment: (postId: string) => void;
  onShare: (threadId: string, title: string) => void;
}

export function ThreadCard({
  thread,
  user,
  expandedComments,
  newComment,
  commenting,
  onToggleComments,
  onCommentChange,
  onComment,
  onShare,
}: ThreadCardProps) {
  const firstPost = thread.posts?.[0];

  if (!firstPost) return null;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/thread/${thread.id}`}>
              <CardTitle className="text-white hover:text-orange-500 transition-colors cursor-pointer mb-2">
                {thread.title}
              </CardTitle>
            </Link>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <Link href={`/user/${getUsername(thread.users)}`}>
                <UserBadge
                  username={getUsername(thread.users)}
                  role={getUserRole(thread.users)}
                  className="text-sm hover:text-orange-400"
                />
              </Link>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{thread.posts?.length || 0} replies</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <div className="bg-zinc-800 rounded-lg p-4">
            {/* Post Author */}
            <div className="flex items-center space-x-2 mb-3">
              <UserBadge
                username={getUsername(firstPost.users)}
                role={getUserRole(firstPost.users)}
                isAnonymous={firstPost.is_anonymous}
                className="text-sm"
              />
              <span className="text-gray-500 text-xs">
                {formatDistanceToNow(new Date(firstPost.created_at), { addSuffix: true })}
              </span>
            </div>

            <div className="text-gray-300 mb-3 line-clamp-3">
              <ValidatedMarkdown content={firstPost.content} />
            </div>

            {/* Media Display */}
            {firstPost.image_url && (
              <div className="mb-3">
                <img src={firstPost.image_url} alt="Post image" className="max-w-full h-48 object-cover rounded" />
              </div>
            )}

            {firstPost.video_url && (
              <div className="mb-3">
                <video controls className="max-w-full h-48 rounded">
                  <source src={firstPost.video_url} type="video/mp4" />
                </video>
              </div>
            )}

            {/* Interaction buttons */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <ReactionButton postId={firstPost.id} />
                <button
                  onClick={() => onToggleComments(firstPost.id)}
                  className="flex items-center space-x-1 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{firstPost.comments?.length || 0}</span>
                  {expandedComments.has(firstPost.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                <button
                  className="flex items-center space-x-1 text-gray-400 hover:text-green-500 transition-colors"
                  onClick={() => onShare(thread.id, thread.title)}
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Comments Section */}
            {expandedComments.has(firstPost.id) && (
              <div className="border-t border-zinc-700 pt-4">
                {/* Show top 3 comments */}
                {firstPost.comments && firstPost.comments.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {firstPost.comments.slice(0, 3).map((comment) => (
                      <div key={comment.id} className="bg-zinc-700 rounded p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <UserBadge
                            username={getUsername(comment.users)}
                            role={getUserRole(comment.users)}
                            isAnonymous={comment.is_anonymous}
                            className="text-xs"
                          />
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="text-gray-300 text-sm">
                          <ValidatedMarkdown content={comment.content} />
                        </div>
                        {comment.image_url && (
                          <img src={comment.image_url} alt="Comment image" className="max-w-xs h-auto rounded mt-2" />
                        )}
                      </div>
                    ))}
                    {firstPost.comments.length > 3 && (
                      <p className="text-sm text-gray-400 text-center">
                        +{firstPost.comments.length - 3} more comments
                      </p>
                    )}
                  </div>
                )}

                {/* Add comment */}
                {user && (
                  <div className="space-y-2">
                    <MentionInput
                      value={newComment[firstPost.id] || ''}
                      onChange={(value) => onCommentChange(firstPost.id, value)}
                      placeholder="Write a comment..."
                      className="bg-zinc-700 border-zinc-600 text-white text-sm rounded-md p-2 w-full resize-none"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={() => onComment(firstPost.id)}
                        disabled={commenting[firstPost.id] || !newComment[firstPost.id]?.trim()}
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        {commenting[firstPost.id] ? '...' : 'Post'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
