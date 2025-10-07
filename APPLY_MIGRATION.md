# Apply Post Editing Migration

## Step 1: Apply Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Add edited_at column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_posts_edited_at ON posts(edited_at);

-- Add RLS policy to allow users to update their own posts
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'posts' 
        AND policyname = 'Users can update their own posts'
    ) THEN
        CREATE POLICY "Users can update their own posts" ON posts
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;
```

## Step 2: Update Queries to Include edited_at

After applying the migration, update the database queries to include the new column.

## Current Status
- ✅ PostEdit component created
- ✅ API endpoint ready
- ✅ Thread page integration complete
- 🔄 **Migration needs to be applied**
- ⏳ Main page integration pending

Once migration is applied, post editing will be fully functional!
