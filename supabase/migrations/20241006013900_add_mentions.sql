-- Create mentions table
CREATE TABLE IF NOT EXISTS mentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  mentioned_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mentioning_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  
  -- Ensure either post_id or comment_id is set, but not both
  CONSTRAINT mentions_post_or_comment CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR 
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mentions_mentioned_user ON mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_post ON mentions(post_id);
CREATE INDEX IF NOT EXISTS idx_mentions_comment ON mentions(comment_id);
CREATE INDEX IF NOT EXISTS idx_mentions_read ON mentions(read);

-- Enable RLS
ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view mentions where they are mentioned" ON mentions
  FOR SELECT USING (auth.uid() = mentioned_user_id);

CREATE POLICY "Users can insert mentions" ON mentions
  FOR INSERT WITH CHECK (auth.uid() = mentioning_user_id);

CREATE POLICY "Users can update their own mention read status" ON mentions
  FOR UPDATE USING (auth.uid() = mentioned_user_id);
