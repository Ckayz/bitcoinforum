-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;

-- Create new delete policy for posts
CREATE POLICY "Users can delete own posts" ON posts
FOR DELETE TO authenticated
USING (auth.uid()::text = user_id::text);

-- Also ensure the posts table has proper RLS enabled
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
