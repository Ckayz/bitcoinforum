/*
  # Manual Bitcoin Forum Database Setup
  
  This migration creates all necessary tables for the Bitcoin Forum:
  - users (user profiles)
  - categories (forum categories) 
  - threads (discussion topics)
  - posts (individual messages)
  - likes (post reactions)
  
  Run this in your Supabase SQL editor to set up the forum.
*/

-- Drop existing tables if they exist (clean setup)
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS posts CASCADE; 
DROP TABLE IF EXISTS threads CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  bio text DEFAULT '',
  avatar_url text DEFAULT '',
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

-- Users policies
CREATE POLICY "Users can read all profiles" ON users FOR SELECT TO public USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Categories policies (public read)
CREATE POLICY "Categories are publicly readable" ON categories FOR SELECT TO public USING (true);

-- Threads policies
CREATE POLICY "Threads are publicly readable" ON threads FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can create threads" ON threads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own threads" ON threads FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own threads" ON threads FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Posts are publicly readable" ON posts FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Likes are publicly readable" ON likes FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can like posts" ON likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own likes" ON likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Insert Bitcoin forum categories
INSERT INTO categories (name, description) VALUES
  ('General Bitcoin', 'General discussions about Bitcoin and cryptocurrency technology'),
  ('Mining & Nodes', 'Bitcoin mining, running nodes, and network infrastructure discussions'),
  ('Trading & Markets', 'Market analysis, trading strategies, and price discussions'),
  ('Wallets & Security', 'Wallet recommendations, security best practices, and safety tips'),
  ('Bitcoin Development', 'Technical development, Lightning Network, and Bitcoin Core updates'),
  ('Regulations & Policy', 'Legal discussions, regulations, and government policies affecting Bitcoin'),
  ('Projects & Jobs', 'Bitcoin projects, job opportunities, and collaboration requests'),
  ('Forum Feedback', 'Feedback and suggestions for improving the Bitcoin Forum experience');