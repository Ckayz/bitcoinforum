-- Temporarily disable RLS on users table to allow signup
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Recreate the insert policy to be more permissive
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can insert own profile" ON users 
FOR INSERT 
WITH CHECK (true);
