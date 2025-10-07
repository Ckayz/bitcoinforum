import { supabase } from './supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: 'mention' | 'reaction' | 'reply' | 'comment';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  post_id?: string;
  comment_id?: string;
  thread_id?: string;
  from_user_id?: string;
  data?: any;
}

// Create mention notification
export async function createMentionNotification(
  mentionedUserId: string,
  fromUserId: string,
  fromUsername: string,
  content: string,
  postId?: string,
  commentId?: string,
  threadId?: string
) {
  const { error } = await supabase.rpc('create_notification', {
    p_user_id: mentionedUserId,
    p_type: 'mention',
    p_title: `${fromUsername} mentioned you`,
    p_message: `${fromUsername} mentioned you: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`,
    p_post_id: postId,
    p_comment_id: commentId,
    p_thread_id: threadId,
    p_from_user_id: fromUserId,
    p_data: { username: fromUsername }
  });

  if (error) {
    console.error('Error creating mention notification:', error);
  }
}

// Create reaction notification
export async function createReactionNotification(
  postAuthorId: string,
  fromUserId: string,
  fromUsername: string,
  reactionType: string,
  postId?: string,
  commentId?: string,
  threadId?: string
) {
  const reactionEmojis: { [key: string]: string } = {
    like: '👍',
    dislike: '👎',
    rocket: '🚀',
    diamond: '💎',
    chart_up: '📈',
    chart_down: '📉',
    fire: '🔥',
    heart: '❤️'
  };

  const emoji = reactionEmojis[reactionType] || '👍';
  
  const { error } = await supabase.rpc('create_notification', {
    p_user_id: postAuthorId,
    p_type: 'reaction',
    p_title: `${fromUsername} reacted to your ${commentId ? 'comment' : 'post'}`,
    p_message: `${fromUsername} reacted with ${emoji} to your ${commentId ? 'comment' : 'post'}`,
    p_post_id: postId,
    p_comment_id: commentId,
    p_thread_id: threadId,
    p_from_user_id: fromUserId,
    p_data: { username: fromUsername, reaction_type: reactionType, emoji }
  });

  if (error) {
    console.error('Error creating reaction notification:', error);
  }
}

// Create reply notification
export async function createReplyNotification(
  postAuthorId: string,
  fromUserId: string,
  fromUsername: string,
  content: string,
  postId: string,
  threadId: string
) {
  const { error } = await supabase.rpc('create_notification', {
    p_user_id: postAuthorId,
    p_type: 'reply',
    p_title: `${fromUsername} replied to your post`,
    p_message: `${fromUsername} replied: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`,
    p_post_id: postId,
    p_thread_id: threadId,
    p_from_user_id: fromUserId,
    p_data: { username: fromUsername }
  });

  if (error) {
    console.error('Error creating reply notification:', error);
  }
}

// Create comment notification
export async function createCommentNotification(
  postAuthorId: string,
  fromUserId: string,
  fromUsername: string,
  content: string,
  postId: string,
  commentId: string,
  threadId: string
) {
  const { error } = await supabase.rpc('create_notification', {
    p_user_id: postAuthorId,
    p_type: 'comment',
    p_title: `${fromUsername} commented on your post`,
    p_message: `${fromUsername} commented: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`,
    p_post_id: postId,
    p_comment_id: commentId,
    p_thread_id: threadId,
    p_from_user_id: fromUserId,
    p_data: { username: fromUsername }
  });

  if (error) {
    console.error('Error creating comment notification:', error);
  }
}

// Get user notifications
export async function getUserNotifications(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data as Notification[];
}

// Mark notification as read
export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
  }
}

// Mark all notifications as read
export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
  }
}

// Get unread notification count
export async function getUnreadNotificationCount(userId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }

  return count || 0;
}
