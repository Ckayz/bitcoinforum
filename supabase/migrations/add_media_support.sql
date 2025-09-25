-- Add media columns to posts table
ALTER TABLE posts ADD COLUMN image_url TEXT;
ALTER TABLE posts ADD COLUMN video_url TEXT;

-- Add image column to comments table  
ALTER TABLE comments ADD COLUMN image_url TEXT;
