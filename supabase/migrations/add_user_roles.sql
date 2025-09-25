-- Add role field to users table for user differentiation
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin'));

-- Update existing users to have 'user' role if null
UPDATE users SET role = 'user' WHERE role IS NULL;
