-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure user can't follow themselves and no duplicate follows
  CONSTRAINT follows_no_self_follow CHECK (follower_id != following_id),
  CONSTRAINT follows_unique UNIQUE (follower_id, following_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at DESC);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view follows" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Update user_stats view to include follow counts
DROP VIEW IF EXISTS user_stats;
CREATE VIEW user_stats AS
SELECT 
  u.id,
  u.username,
  u.avatar_url,
  u.bio,
  u.location,
  u.website,
  u.twitter,
  u.github,
  u.reputation,
  u.created_at,
  u.profile_updated_at,
  COALESCE(post_count.count, 0) as post_count,
  COALESCE(comment_count.count, 0) as comment_count,
  COALESCE(reaction_count.count, 0) as reactions_given,
  COALESCE(received_reactions.count, 0) as reactions_received,
  COALESCE(mention_count.count, 0) as mentions_received,
  COALESCE(follower_count.count, 0) as followers_count,
  COALESCE(following_count.count, 0) as following_count
FROM users u
LEFT JOIN (
  SELECT user_id, COUNT(*) as count 
  FROM posts 
  GROUP BY user_id
) post_count ON u.id = post_count.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as count 
  FROM comments 
  GROUP BY user_id
) comment_count ON u.id = comment_count.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as count 
  FROM reactions 
  GROUP BY user_id
) reaction_count ON u.id = reaction_count.user_id
LEFT JOIN (
  SELECT 
    COALESCE(p.user_id, c.user_id) as user_id,
    COUNT(*) as count
  FROM reactions r
  LEFT JOIN posts p ON r.post_id = p.id
  LEFT JOIN comments c ON r.comment_id = c.id
  GROUP BY COALESCE(p.user_id, c.user_id)
) received_reactions ON u.id = received_reactions.user_id
LEFT JOIN (
  SELECT mentioned_user_id as user_id, COUNT(*) as count 
  FROM mentions 
  GROUP BY mentioned_user_id
) mention_count ON u.id = mention_count.user_id
LEFT JOIN (
  SELECT following_id as user_id, COUNT(*) as count 
  FROM follows 
  GROUP BY following_id
) follower_count ON u.id = follower_count.user_id
LEFT JOIN (
  SELECT follower_id as user_id, COUNT(*) as count 
  FROM follows 
  GROUP BY follower_id
) following_count ON u.id = following_count.user_id;

-- Function to create follow notification
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
DECLARE
  follower_username TEXT;
BEGIN
  -- Get follower's username
  SELECT username INTO follower_username
  FROM users
  WHERE id = NEW.follower_id;
  
  -- Create notification for the user being followed
  INSERT INTO notifications (
    user_id, type, title, message, from_user_id, data
  ) VALUES (
    NEW.following_id,
    'follow',
    follower_username || ' started following you',
    follower_username || ' is now following you',
    NEW.follower_id,
    jsonb_build_object('username', follower_username)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for follow notifications
CREATE TRIGGER trigger_follow_notification
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION create_follow_notification();
