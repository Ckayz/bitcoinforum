# Add Sample Bitcoin News

## Apply the news migration:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor  
3. Copy and paste the contents of `supabase/migrations/add_sample_news.sql`
4. Execute the SQL

## What this adds:

- **Verified user role** to users table
- **BitcoinNewsBot** verified user account
- **4 sample Bitcoin news threads** with realistic content:
  1. Bitcoin Reaches New All-Time High Above $73,000
  2. Major Investment Firm Adds Bitcoin to Treasury Holdings  
  3. Lightning Network Reaches 5,000 BTC Capacity Milestone
  4. Bitcoin Mining Difficulty Adjusts to Record High

## News Section Restrictions:

- Only **verified users** can create new threads in News section
- Regular users will see "Only verified users can post in the News section" message
- Verified users show green checkmark badge

## To make a user verified:

```sql
UPDATE users SET role = 'verified' WHERE email = 'user@example.com';
```

The News section will now have sample content and proper access controls.
