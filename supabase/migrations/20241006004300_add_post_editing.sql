-- Add edited_at column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_posts_edited_at ON posts(edited_at);

-- Add RLS policy to allow users to update their own posts
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'posts' 
        AND policyname = 'Users can update their own posts'
    ) THEN
        CREATE POLICY "Users can update their own posts" ON posts
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;
