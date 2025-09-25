-- Fresh Bitcoin Forum Database Setup
-- Run this on empty Supabase database

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  bio text DEFAULT '',
  avatar_url text DEFAULT '',
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create threads table
CREATE TABLE threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create posts table
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create likes table
CREATE TABLE likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Users insert own" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);

CREATE POLICY "Public read threads" ON threads FOR SELECT USING (true);
CREATE POLICY "Auth create threads" ON threads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own threads" ON threads FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Public read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Auth create posts" ON posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Public read likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Auth create likes" ON likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Insert categories
INSERT INTO categories (name, description) VALUES
  ('General Bitcoin', 'General discussions about Bitcoin and cryptocurrency technology'),
  ('Mining & Nodes', 'Bitcoin mining, running nodes, and network infrastructure discussions'),
  ('Trading & Markets', 'Market analysis, trading strategies, and price discussions'),
  ('Wallets & Security', 'Wallet recommendations, security best practices, and safety tips'),
  ('Bitcoin Development', 'Technical development, Lightning Network, and Bitcoin Core updates'),
  ('Regulations & Policy', 'Legal discussions, regulations, and government policies affecting Bitcoin'),
  ('Projects & Jobs', 'Bitcoin projects, job opportunities, and collaboration requests'),
  ('Forum Feedback', 'Feedback and suggestions for improving the Bitcoin Forum experience'),
  ('News', 'Latest Bitcoin news, updates, and important announcements');

-- Create news bot user
INSERT INTO users (id, username, email, role, bio) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'BitcoinNewsBot', 'news@bitcoinforum.com', 'verified', 'Official Bitcoin News Bot');

-- Create sample news threads
DO $$
DECLARE
    news_category_id UUID;
    news_user_id UUID := '550e8400-e29b-41d4-a716-446655440000';
    thread1_id UUID;
    thread2_id UUID;
BEGIN
    SELECT id INTO news_category_id FROM categories WHERE name = 'News';
    
    INSERT INTO threads (category_id, user_id, title, created_at) VALUES 
      (news_category_id, news_user_id, 'Bitcoin Reaches New All-Time High Above $73,000', NOW() - INTERVAL '2 hours')
    RETURNING id INTO thread1_id;
    
    INSERT INTO threads (category_id, user_id, title, created_at) VALUES 
      (news_category_id, news_user_id, 'Lightning Network Reaches 5,000 BTC Capacity Milestone', NOW() - INTERVAL '1 day')
    RETURNING id INTO thread2_id;
    
    INSERT INTO posts (thread_id, user_id, content, created_at) VALUES 
      (thread1_id, news_user_id, 'Bitcoin has surged to a new all-time high of $73,847, driven by increased institutional adoption and growing retail interest. The cryptocurrency has gained over 15% in the past week.

Key highlights:
• Price reached $73,847 at 14:30 UTC
• 24-hour trading volume exceeded $45 billion
• Market cap now over $1.45 trillion
• ETF inflows totaled $2.1 billion this week', NOW() - INTERVAL '2 hours'),
      
      (thread2_id, news_user_id, 'The Bitcoin Lightning Network has reached a significant milestone with over 5,000 BTC now locked in payment channels, representing a 25% increase from last quarter.

Network statistics:
• Total capacity: 5,127 BTC (~$378 million)
• Active channels: 76,542
• Active nodes: 15,234
• Average channel size: 0.067 BTC', NOW() - INTERVAL '1 day');
END $$;
