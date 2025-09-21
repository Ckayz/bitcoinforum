/*
  # Bitcoin Forum Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches auth.users.id
      - `username` (text, unique) - display name for forum
      - `email` (text, unique) - user email
      - `bio` (text, optional) - user bio
      - `avatar_url` (text, optional) - profile picture
      - `created_at` (timestamp) - account creation time

    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique) - category name
      - `description` (text) - category description
      - `created_at` (timestamp) - category creation time

    - `threads`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key) - references categories.id
      - `user_id` (uuid, foreign key) - references users.id
      - `title` (text) - thread title
      - `created_at` (timestamp) - thread creation time

    - `posts`
      - `id` (uuid, primary key)
      - `thread_id` (uuid, foreign key) - references threads.id
      - `user_id` (uuid, foreign key) - references users.id
      - `content` (text) - post content
      - `created_at` (timestamp) - post creation time

    - `likes`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key) - references posts.id
      - `user_id` (uuid, foreign key) - references users.id

  2. Security
    - Enable RLS on all tables
    - Allow public read access for categories, threads, and posts
    - Restrict write operations to authenticated users
    - Users can only edit/delete their own content
    - Users can only like posts once per post
*/

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  bio text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Threads table
CREATE TABLE IF NOT EXISTS threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(post_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read all profiles"
  ON users FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  TO public
  USING (true);

-- Threads policies
CREATE POLICY "Threads are publicly readable"
  ON threads FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create threads"
  ON threads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own threads"
  ON threads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own threads"
  ON threads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Posts are publicly readable"
  ON posts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Likes are publicly readable"
  ON likes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can like posts"
  ON likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own likes"
  ON likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('General Bitcoin', 'General discussions about Bitcoin and cryptocurrency'),
  ('Mining & Nodes', 'Bitcoin mining, running nodes, and network infrastructure'),
  ('Trading & Markets', 'Market analysis, trading strategies, and price discussions'),
  ('Wallets & Security', 'Wallet recommendations, security best practices, and safety tips'),
  ('Bitcoin Development', 'Technical development, Lightning Network, and Bitcoin Core'),
  ('Regulations & Policy', 'Legal discussions, regulations, and government policies'),
  ('Projects & Jobs', 'Bitcoin projects, job opportunities, and collaborations'),
  ('Forum Feedback', 'Feedback and suggestions for improving the forum')
ON CONFLICT (name) DO NOTHING;