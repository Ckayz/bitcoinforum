-- Fix user signup RLS policy to allow new user creation
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create a more permissive insert policy for user signup
CREATE POLICY "Users can insert own profile" ON users 
FOR INSERT TO authenticated 
WITH CHECK (
  auth.uid() = id OR 
  (auth.uid() IS NOT NULL AND id IS NULL) OR
  (auth.uid() IS NOT NULL)
);

-- Also ensure the role column has a proper default
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';
