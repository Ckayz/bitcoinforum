-- Re-enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Fix delete policies with proper UUID comparison
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own threads" ON threads;

CREATE POLICY "Users can delete own posts" ON posts
FOR DELETE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own threads" ON threads
FOR DELETE TO authenticated
USING (user_id = auth.uid());
