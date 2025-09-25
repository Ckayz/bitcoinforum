# Apply Database Migration

To add the comments system and anonymous posting feature, you need to apply the database migration:

## Option 1: Using Supabase CLI
```bash
npx supabase db push
```

## Option 2: Manual SQL Execution
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/add_comments_and_anonymous.sql`
4. Execute the SQL

## What the migration adds:
- `is_anonymous` column to `threads` and `posts` tables
- `comments` table for post comments
- `comment_likes` table for comment likes
- All necessary RLS policies

## Features Added:
1. **Anonymous Posting**: Users can choose to post threads/posts/comments anonymously
2. **Comments System**: Users can comment on posts (separate from thread replies)
3. **Comment Likes**: Users can like individual comments
4. **Nested Interactions**: Comments are expandable/collapsible per post

## Usage:
- When creating threads/posts: Check "Post anonymously" 
- When commenting: Check "Comment anonymously"
- Click comment count to expand/collapse comments
- Like posts and comments with heart button
