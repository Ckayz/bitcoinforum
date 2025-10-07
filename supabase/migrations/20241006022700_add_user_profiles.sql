-- Add profile fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS twitter TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS github TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reputation INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create user_stats view for calculated statistics
CREATE OR REPLACE VIEW user_stats AS
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
  COALESCE(mention_count.count, 0) as mentions_received
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
) mention_count ON u.id = mention_count.user_id;

-- Create user_activity view for activity timeline
CREATE OR REPLACE VIEW user_activity AS
(
  SELECT 
    'post' as activity_type,
    p.id as activity_id,
    p.user_id,
    p.content,
    p.created_at,
    t.title as thread_title,
    t.id as thread_id,
    NULL as post_id,
    NULL as comment_id
  FROM posts p
  JOIN threads t ON p.thread_id = t.id
)
UNION ALL
(
  SELECT 
    'comment' as activity_type,
    c.id as activity_id,
    c.user_id,
    c.content,
    c.created_at,
    t.title as thread_title,
    t.id as thread_id,
    c.post_id,
    c.id as comment_id
  FROM comments c
  JOIN posts p ON c.post_id = p.id
  JOIN threads t ON p.thread_id = t.id
)
UNION ALL
(
  SELECT 
    'reaction' as activity_type,
    r.id as activity_id,
    r.user_id,
    r.reaction_type as content,
    r.created_at,
    t.title as thread_title,
    t.id as thread_id,
    r.post_id,
    r.comment_id
  FROM reactions r
  LEFT JOIN posts p ON r.post_id = p.id
  LEFT JOIN comments c ON r.comment_id = c.id
  LEFT JOIN threads t ON (p.thread_id = t.id OR (c.post_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM posts p2 WHERE p2.id = c.post_id AND p2.thread_id = t.id
  )))
);

-- Update user reputation based on activity (can be run periodically)
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS void AS $$
BEGIN
  UPDATE users SET reputation = (
    SELECT 
      COALESCE(post_count.count * 5, 0) + 
      COALESCE(comment_count.count * 2, 0) + 
      COALESCE(received_reactions.count * 1, 0)
    FROM users u2
    LEFT JOIN (
      SELECT user_id, COUNT(*) as count FROM posts GROUP BY user_id
    ) post_count ON u2.id = post_count.user_id
    LEFT JOIN (
      SELECT user_id, COUNT(*) as count FROM comments GROUP BY user_id
    ) comment_count ON u2.id = comment_count.user_id
    LEFT JOIN (
      SELECT 
        COALESCE(p.user_id, c.user_id) as user_id,
        COUNT(*) as count
      FROM reactions r
      LEFT JOIN posts p ON r.post_id = p.id
      LEFT JOIN comments c ON r.comment_id = c.id
      GROUP BY COALESCE(p.user_id, c.user_id)
    ) received_reactions ON u2.id = received_reactions.user_id
    WHERE u2.id = users.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
