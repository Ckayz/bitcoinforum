/**
 * Utility functions for working with Supabase query results
 */

/**
 * Normalizes Supabase join results from arrays to single objects
 * Supabase returns joins as arrays when using foreign key syntax (table!fkey_name)
 */
export function normalizeSingle<T>(data: T | T[] | null | undefined): T | null {
  if (!data) return null;
  if (Array.isArray(data)) {
    return data[0] || null;
  }
  return data;
}

/**
 * Safely extracts username from a Supabase user join result
 */
export function getUsername(users: any): string {
  const normalized = normalizeSingle(users);
  return normalized?.username || 'Unknown';
}

/**
 * Safely extracts user role from a Supabase user join result
 */
export function getUserRole(users: any): string | undefined {
  const normalized = normalizeSingle(users);
  return normalized?.role;
}

/**
 * Safely extracts avatar URL from a Supabase user join result
 */
export function getAvatarUrl(users: any): string | undefined {
  const normalized = normalizeSingle(users);
  return normalized?.avatar_url;
}

/**
 * Normalizes a thread object with nested joins
 */
export function normalizeThread(thread: any): any {
  return {
    ...thread,
    users: normalizeSingle(thread.users),
    posts: thread.posts?.map((post: any) => normalizePost(post))
  };
}

/**
 * Normalizes a post object with nested joins
 */
export function normalizePost(post: any): any {
  return {
    ...post,
    users: normalizeSingle(post.users),
    comments: post.comments?.map((comment: any) => normalizeComment(comment))
  };
}

/**
 * Normalizes a comment object with nested joins
 */
export function normalizeComment(comment: any): any {
  return {
    ...comment,
    users: normalizeSingle(comment.users)
  };
}
