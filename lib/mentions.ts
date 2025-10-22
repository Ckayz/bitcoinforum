import { supabase } from './supabase';
import { createMentionNotification } from './notifications';

// Extract @username mentions from text
export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    const username = match[1];
    if (!mentions.includes(username)) {
      mentions.push(username);
    }
  }
  
  return mentions;
}

// Get user IDs from usernames
export async function getUserIdsByUsernames(usernames: string[]): Promise<{ [username: string]: string }> {
  if (usernames.length === 0) return {};
  
  const { data, error } = await supabase
    .from('users')
    .select('id, username')
    .in('username', usernames);
  
  if (error) {
    console.error('Error fetching user IDs:', error);
    return {};
  }
  
  const userMap: { [username: string]: string } = {};
  data?.forEach(user => {
    if (user.username && user.id) {
      userMap[user.username] = user.id;
    }
  });
  
  return userMap;
}

// Create mention records in database
export async function createMentions(
  mentionedUserIds: string[],
  mentioningUserId: string,
  postId?: string,
  commentId?: string
) {
  if (mentionedUserIds.length === 0) return;
  
  const mentions = mentionedUserIds.map(userId => ({
    mentioned_user_id: userId,
    mentioning_user_id: mentioningUserId,
    post_id: postId || null,
    comment_id: commentId || null,
  }));
  
  const { error } = await supabase
    .from('mentions')
    .insert(mentions);
  
  if (error) {
    console.error('Error creating mentions:', error);
  }
}

// Process mentions in content and create database records
export async function processMentions(
  content: string,
  mentioningUserId: string,
  postId?: string,
  commentId?: string
) {
  const mentionedUsernames = extractMentions(content);
  if (mentionedUsernames.length === 0) return;
  
  const userMap = await getUserIdsByUsernames(mentionedUsernames);
  const mentionedUserIds = Object.values(userMap);
  
  await createMentions(mentionedUserIds, mentioningUserId, postId, commentId);
  
  // Create notifications for mentioned users
  const { data: mentioningUser } = await supabase
    .from('users')
    .select('username')
    .eq('id', mentioningUserId)
    .single();
  
  const mentioningUsername = mentioningUser?.username || 'Someone';
  
  // Get thread ID if we have post or comment
  let threadId: string | undefined;
  if (postId) {
    const { data: post } = await supabase
      .from('posts')
      .select('thread_id')
      .eq('id', postId)
      .single();
    threadId = post?.thread_id;
  } else if (commentId) {
    const { data: comment } = await supabase
      .from('comments')
      .select('post_id')
      .eq('id', commentId)
      .single();
    
    if (comment?.post_id) {
      const { data: post } = await supabase
        .from('posts')
        .select('thread_id')
        .eq('id', comment.post_id)
        .single();
      threadId = post?.thread_id;
    }
  }
  
  // Create notification for each mentioned user
  for (const userId of mentionedUserIds) {
    await createMentionNotification(
      userId,
      mentioningUserId,
      mentioningUsername,
      content,
      postId,
      commentId,
      threadId
    );
  }
}

// Highlight mentions in text for display
export function highlightMentions(text: string): string {
  return text.replace(
    /@(\w+)/g,
    '<span class="text-orange-400 font-medium bg-orange-500/10 px-1 rounded">@$1</span>'
  );
}
