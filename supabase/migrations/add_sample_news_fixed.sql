-- Add verified role to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Temporarily disable RLS to insert the news bot user
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Create a verified user for posting news
INSERT INTO users (id, username, email, role, bio) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'BitcoinNewsBot', 'news@bitcoinforum.com', 'verified', 'Official Bitcoin News Bot')
ON CONFLICT (id) DO NOTHING;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Get News category ID and create sample threads
DO $$
DECLARE
    news_category_id UUID;
    news_user_id UUID := '550e8400-e29b-41d4-a716-446655440000';
    thread1_id UUID;
    thread2_id UUID;
    thread3_id UUID;
    thread4_id UUID;
BEGIN
    -- Get News category ID
    SELECT id INTO news_category_id FROM categories WHERE name = 'News' LIMIT 1;
    
    IF news_category_id IS NOT NULL THEN
        -- Create Bitcoin news threads
        INSERT INTO threads (id, category_id, user_id, title, created_at) VALUES 
          (gen_random_uuid(), news_category_id, news_user_id, 'Bitcoin Reaches New All-Time High Above $73,000', NOW() - INTERVAL '2 hours')
        RETURNING id INTO thread1_id;
        
        INSERT INTO threads (id, category_id, user_id, title, created_at) VALUES 
          (gen_random_uuid(), news_category_id, news_user_id, 'Major Investment Firm Adds Bitcoin to Treasury Holdings', NOW() - INTERVAL '6 hours')
        RETURNING id INTO thread2_id;
        
        INSERT INTO threads (id, category_id, user_id, title, created_at) VALUES 
          (gen_random_uuid(), news_category_id, news_user_id, 'Lightning Network Reaches 5,000 BTC Capacity Milestone', NOW() - INTERVAL '1 day')
        RETURNING id INTO thread3_id;
        
        INSERT INTO threads (id, category_id, user_id, title, created_at) VALUES 
          (gen_random_uuid(), news_category_id, news_user_id, 'Bitcoin Mining Difficulty Adjusts to Record High', NOW() - INTERVAL '2 days')
        RETURNING id INTO thread4_id;
        
        -- Create news posts content
        INSERT INTO posts (thread_id, user_id, content, created_at) VALUES 
          (thread1_id, news_user_id, 'Bitcoin has surged to a new all-time high of $73,847, driven by increased institutional adoption and growing retail interest. The cryptocurrency has gained over 15% in the past week, with analysts citing strong ETF inflows and positive regulatory developments as key drivers.

Key highlights:
• Price reached $73,847 at 14:30 UTC
• 24-hour trading volume exceeded $45 billion
• Market cap now over $1.45 trillion
• ETF inflows totaled $2.1 billion this week

This milestone comes as major corporations continue to add Bitcoin to their balance sheets, signaling growing confidence in the digital asset as a store of value.', NOW() - INTERVAL '2 hours'),
          
          (thread2_id, news_user_id, 'MicroStrategy announced today that it has purchased an additional 15,350 BTC for approximately $1.1 billion, bringing its total Bitcoin holdings to over 174,000 BTC worth approximately $12.8 billion.

The enterprise software company, led by Michael Saylor, continues to execute its Bitcoin treasury strategy despite market volatility. This latest purchase was funded through a combination of cash and proceeds from convertible note offerings.

"Bitcoin remains the world''s most robust store of value and we will continue to accumulate it," said Saylor in a statement. The company now holds approximately 0.83% of the total Bitcoin supply.

Other major firms following similar strategies include Tesla, Block, and Marathon Digital Holdings.', NOW() - INTERVAL '6 hours'),
          
          (thread3_id, news_user_id, 'The Bitcoin Lightning Network has reached a significant milestone with over 5,000 BTC now locked in payment channels, representing a 25% increase from last quarter.

Network statistics:
• Total capacity: 5,127 BTC (~$378 million)
• Active channels: 76,542
• Active nodes: 15,234
• Average channel size: 0.067 BTC

The growth is attributed to increased adoption by merchants, improved wallet integrations, and the launch of several Lightning-native applications. Major exchanges including Kraken, Bitfinex, and River have integrated Lightning deposits and withdrawals.

Strike CEO Jack Mallers commented: "Lightning is becoming the global payments rail we always envisioned. This growth in capacity shows real economic activity happening on the network."', NOW() - INTERVAL '1 day'),
          
          (thread4_id, news_user_id, 'Bitcoin''s mining difficulty has adjusted upward by 3.92% to a new record high of 83.95 trillion, reflecting the continued growth in network hash rate and mining competition.

Mining metrics:
• New difficulty: 83.95T (+3.92%)
• Estimated hash rate: 600 EH/s
• Next adjustment: ~12 days
• Average block time: 9.8 minutes

The difficulty increase comes as miners continue to deploy next-generation ASIC hardware and expand operations despite recent market volatility. The rising difficulty demonstrates the robust security of the Bitcoin network.

Mining pool distribution remains healthy with no single pool controlling more than 20% of the hash rate. F2Pool leads with 18.2%, followed by AntPool at 16.8% and Foundry USA at 15.1%.', NOW() - INTERVAL '2 days');
    END IF;
END $$;
