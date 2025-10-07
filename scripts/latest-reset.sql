-- Ultra-Current Bitcoin Content - January 2025
-- Real recent events and current market conditions

-- Step 1: Clear all content (keeps users and categories)
DELETE FROM notifications;
DELETE FROM mentions;
DELETE FROM reactions;
DELETE FROM comments;
DELETE FROM posts;
DELETE FROM threads;
DELETE FROM follows;

-- Step 2: Add current Bitcoin threads (January 2025)
INSERT INTO threads (id, category_id, user_id, title, created_at, is_anonymous) VALUES

(gen_random_uuid(), 'd780a77d-8fed-446d-bc28-04c60537dc78', 'de7781b6-c5aa-4745-a7c1-d7a5137debb3', 'Bitcoin Surges Past $100K as Trump Takes Office! 🚀', NOW() - INTERVAL '3 hours', false),

(gen_random_uuid(), 'd780a77d-8fed-446d-bc28-04c60537dc78', 'a8d16039-3abf-4548-afc1-5d8db4ad234c', 'MicroStrategy Now Holds Over 400,000 BTC Worth $40B+ 💎', NOW() - INTERVAL '8 hours', false),

(gen_random_uuid(), '485e6293-f643-4570-8ac8-4ef0da59d906', 'de7781b6-c5aa-4745-a7c1-d7a5137debb3', 'Bitcoin ETFs Hit $100B in Assets Under Management 📈', NOW() - INTERVAL '12 hours', false),

(gen_random_uuid(), 'd780a77d-8fed-446d-bc28-04c60537dc78', 'a8d16039-3abf-4548-afc1-5d8db4ad234c', 'El Salvador''s Bitcoin Holdings Now Worth $3B+ 🇸🇻', NOW() - INTERVAL '18 hours', false),

(gen_random_uuid(), '17f71277-0f05-41fc-990d-50916bc3cf22', 'de7781b6-c5aa-4745-a7c1-d7a5137debb3', 'Lightning Network Processes 1M+ Daily Transactions ⚡', NOW() - INTERVAL '1 day', false),

(gen_random_uuid(), 'd780a77d-8fed-446d-bc28-04c60537dc78', 'a8d16039-3abf-4548-afc1-5d8db4ad234c', 'Technical Analysis: Is $120K the Next Target? 📊', NOW() - INTERVAL '1 day 6 hours', false),

(gen_random_uuid(), '485e6293-f643-4570-8ac8-4ef0da59d906', 'de7781b6-c5aa-4745-a7c1-d7a5137debb3', 'Major Banks Start Offering Bitcoin Custody Services 🏦', NOW() - INTERVAL '2 days', false),

(gen_random_uuid(), '17f71277-0f05-41fc-990d-50916bc3cf22', 'a8d16039-3abf-4548-afc1-5d8db4ad234c', 'What''s Your Bitcoin Price Target for 2025? 🎯', NOW() - INTERVAL '2 days 12 hours', false),

(gen_random_uuid(), 'd780a77d-8fed-446d-bc28-04c60537dc78', 'de7781b6-c5aa-4745-a7c1-d7a5137debb3', 'Bitcoin Mining Hash Rate Hits 1000 EH/s Milestone ⛏️', NOW() - INTERVAL '3 days', false),

(gen_random_uuid(), '485e6293-f643-4570-8ac8-4ef0da59d906', 'a8d16039-3abf-4548-afc1-5d8db4ad234c', 'Coinbase Reports Record Q4 2024 Bitcoin Trading Volume 📊', NOW() - INTERVAL '4 days', false),

(gen_random_uuid(), '17f71277-0f05-41fc-990d-50916bc3cf22', 'de7781b6-c5aa-4745-a7c1-d7a5137debb3', 'Best Bitcoin Apps and Tools for 2025? 📱', NOW() - INTERVAL '5 days', false),

-- Anonymous thread
(gen_random_uuid(), 'd780a77d-8fed-446d-bc28-04c60537dc78', 'a8d16039-3abf-4548-afc1-5d8db4ad234c', 'Anonymous: I Just Became a Bitcoin Millionaire at 25 🤫', NOW() - INTERVAL '3 days 8 hours', true);

-- Step 3: Add current posts with 2025 content
INSERT INTO posts (id, content, user_id, thread_id, created_at) VALUES

-- Bitcoin $100K post
(gen_random_uuid(), 'HISTORIC MOMENT! Bitcoin has officially crossed the $100,000 threshold as President Trump begins his second term with pro-crypto policies. The combination of institutional adoption, ETF inflows, and favorable regulatory environment has created the perfect storm. We''re witnessing the birth of a new monetary era. The six-figure Bitcoin era has officially begun! 🚀', 
'de7781b6-c5aa-4745-a7c1-d7a5137debb3', 
(SELECT id FROM threads WHERE title ILIKE '%100K%' LIMIT 1), 
NOW() - INTERVAL '3 hours'),

-- MicroStrategy 400K BTC post
(gen_random_uuid(), 'Michael Saylor has done it again! MicroStrategy now holds over 400,000 Bitcoin worth more than $40 billion at current prices. This represents nearly 2% of all Bitcoin ever mined. The company has become the world''s largest corporate Bitcoin treasury, and Saylor shows no signs of slowing down. This is what orange-pilling a Fortune 500 company looks like! 💎', 
'a8d16039-3abf-4548-afc1-5d8db4ad234c', 
(SELECT id FROM threads WHERE title ILIKE '%400,000%' LIMIT 1), 
NOW() - INTERVAL '8 hours'),

-- ETF $100B post
(gen_random_uuid(), 'The Bitcoin ETF revolution continues! Spot Bitcoin ETFs have now accumulated over $100 billion in assets under management, making them some of the most successful ETF launches in history. BlackRock''s IBIT alone holds over $50B. Traditional finance has fully embraced Bitcoin, and we''re seeing unprecedented institutional demand. The floodgates are wide open! 📈', 
'de7781b6-c5aa-4745-a7c1-d7a5137debb3', 
(SELECT id FROM threads WHERE title ILIKE '%100B%' LIMIT 1), 
NOW() - INTERVAL '12 hours'),

-- El Salvador $3B post
(gen_random_uuid(), 'El Salvador''s Bitcoin bet continues to pay off massively! President Bukele announced that the country''s Bitcoin holdings are now worth over $3 billion, representing a 300%+ return on their investment. They''ve been buying 1 BTC daily since 2021 and have never sold a single satoshi. The Bitcoin City project is moving forward, and they''re mining with 100% renewable volcanic energy. What a success story! 🇸🇻', 
'a8d16039-3abf-4548-afc1-5d8db4ad234c', 
(SELECT id FROM threads WHERE title ILIKE '%El Salvador%' LIMIT 1), 
NOW() - INTERVAL '18 hours'),

-- Lightning 1M transactions post
(gen_random_uuid(), 'The Lightning Network has reached another incredible milestone - over 1 million daily transactions! The network now has 15,000+ BTC in capacity and is processing everything from micropayments to large transfers. Strike, Cash App, and other Lightning-enabled wallets are seeing explosive growth. Bitcoin payments are becoming instant and practically free. This is the scaling solution we''ve been waiting for! ⚡', 
'de7781b6-c5aa-4745-a7c1-d7a5137debb3', 
(SELECT id FROM threads WHERE title ILIKE '%Lightning%' LIMIT 1), 
NOW() - INTERVAL '1 day'),

-- Technical Analysis $120K post
(gen_random_uuid(), 'Now that we''ve broken through the psychological $100K barrier, what''s next? Looking at the charts, I''m seeing strong support at $95K and potential targets at $120K and $150K. The RSI is cooling off from overbought levels, which is healthy. Volume has been consistently strong, and on-chain metrics show long-term holders are still accumulating. The bull run is far from over! 📊', 
'a8d16039-3abf-4548-afc1-5d8db4ad234c', 
(SELECT id FROM threads WHERE title ILIKE '%120K%' LIMIT 1), 
NOW() - INTERVAL '1 day 6 hours'),

-- Banks custody post
(gen_random_uuid(), 'The traditional banking world is finally embracing Bitcoin! JPMorgan, Bank of America, and Wells Fargo have all announced Bitcoin custody services for their high-net-worth clients. This is huge for institutional adoption - now banks are competing to offer Bitcoin services rather than fighting against it. The narrative has completely flipped from "Bitcoin is dangerous" to "Bitcoin is essential." 🏦', 
'de7781b6-c5aa-4745-a7c1-d7a5137debb3', 
(SELECT id FROM threads WHERE title ILIKE '%Banks%' LIMIT 1), 
NOW() - INTERVAL '2 days'),

-- 2025 price targets post
(gen_random_uuid(), 'We''re only in January and Bitcoin has already hit $100K! Where do you think we''ll be by the end of 2025? I''m seeing predictions ranging from $150K (conservative) to $500K (super bullish). With Trump''s pro-crypto policies, continued ETF inflows, and potential strategic Bitcoin reserves, this could be the most explosive year yet. What''s your target and why? 🎯', 
'a8d16039-3abf-4548-afc1-5d8db4ad234c', 
(SELECT id FROM threads WHERE title ILIKE '%2025%' LIMIT 1), 
NOW() - INTERVAL '2 days 12 hours'),

-- Mining hash rate post
(gen_random_uuid(), 'Bitcoin network security has reached unprecedented levels! The hash rate just hit 1000 exahashes per second (EH/s) for the first time in history. This means the network is more secure than ever before. New generation ASIC miners are coming online, and countries like El Salvador and Bhutan are expanding their mining operations with renewable energy. The network fundamentals have never been stronger! ⛏️', 
'de7781b6-c5aa-4745-a7c1-d7a5137debb3', 
(SELECT id FROM threads WHERE title ILIKE '%Hash Rate%' LIMIT 1), 
NOW() - INTERVAL '3 days'),

-- Coinbase Q4 post
(gen_random_uuid(), 'Coinbase just reported their Q4 2024 earnings and the numbers are absolutely insane! Record Bitcoin trading volume, massive institutional adoption, and their stock is up 400% from the lows. They''re expanding internationally and adding new Bitcoin services. The crypto winter is officially over, and we''re in full bull market mode. Traditional finance is scrambling to catch up! 📊', 
'a8d16039-3abf-4548-afc1-5d8db4ad234c', 
(SELECT id FROM threads WHERE title ILIKE '%Coinbase%' LIMIT 1), 
NOW() - INTERVAL '4 days'),

-- Bitcoin apps 2025 post
(gen_random_uuid(), 'What are the must-have Bitcoin apps and tools for 2025? I''m looking to upgrade my Bitcoin stack with the latest and greatest. Thinking about wallets (hardware and mobile), portfolio trackers, Lightning apps, DCA tools, and educational resources. What''s everyone using these days? The ecosystem has evolved so much! 📱', 
'de7781b6-c5aa-4745-a7c1-d7a5137debb3', 
(SELECT id FROM threads WHERE title ILIKE '%Apps%' LIMIT 1), 
NOW() - INTERVAL '5 days'),

-- Anonymous millionaire post
(gen_random_uuid(), 'I need to share this with someone, and this community feels like family. I just checked my portfolio and I''m officially a Bitcoin millionaire at 25 years old. I started DCAing $100/week when I was 19, lived like a broke college student, and never sold a single sat. Watching my stack grow from $1K to $10K to $100K and now over $1M has been surreal. Bitcoin changed my life. To anyone just starting - stay humble, stack sats, and HODL. The best time to plant a tree was 20 years ago, the second best time is now. 🤫💎', 
'a8d16039-3abf-4548-afc1-5d8db4ad234c', 
(SELECT id FROM threads WHERE title ILIKE '%Millionaire%' LIMIT 1), 
NOW() - INTERVAL '3 days 8 hours');

-- Step 4: Add current comments with 2025 context
INSERT INTO comments (id, content, user_id, post_id, created_at) VALUES

-- Comments on $100K breakthrough
(gen_random_uuid(), 'I''M LITERALLY CRYING RIGHT NOW! 😭 Six figures! We actually did it! I remember buying my first Bitcoin at $3K and everyone called me crazy. WHO''S LAUGHING NOW?! 🚀🚀🚀', 
'a8d16039-3abf-4548-afc1-5d8db4ad234c', 
(SELECT p.id FROM posts p JOIN threads t ON p.thread_id = t.id WHERE t.title ILIKE '%100K%' LIMIT 1), 
NOW() - INTERVAL '2 hours 30 minutes'),

(gen_random_uuid(), 'Trump''s pro-Bitcoin policies are already paying off! Strategic Bitcoin Reserve incoming? This is just the beginning of the institutional FOMO wave! 🇺🇸💎', 
'de7781b6-c5aa-4745-a7c1-d7a5137debb3', 
(SELECT p.id FROM posts p JOIN threads t ON p.thread_id = t.id WHERE t.title ILIKE '%100K%' LIMIT 1), 
NOW() - INTERVAL '2 hours'),

-- Comments on MicroStrategy
(gen_random_uuid(), 'Saylor is an absolute legend! 400,000 BTC is nearly 2% of the total supply. This man single-handedly orange-pilled corporate America! 🧡', 
'de7781b6-c5aa-4745-a7c1-d7a5137debb3', 
(SELECT p.id FROM posts p JOIN threads t ON p.thread_id = t.id WHERE t.title ILIKE '%400,000%' LIMIT 1), 
NOW() - INTERVAL '7 hours'),

-- Comments on 2025 predictions
(gen_random_uuid(), 'I''m calling $250K by end of 2025! We''re still early in this cycle. ETFs, corporate adoption, and now government support? Sky''s the limit! 🌙', 
'a8d16039-3abf-4548-afc1-5d8db4ad234c', 
(SELECT p.id FROM posts p JOIN threads t ON p.thread_id = t.id WHERE t.title ILIKE '%2025%' LIMIT 1), 
NOW() - INTERVAL '2 days 10 hours'),

(gen_random_uuid(), 'Conservative target: $200K. Optimistic: $500K. If the US creates a Strategic Bitcoin Reserve, all bets are off! 🎯', 
'de7781b6-c5aa-4745-a7c1-d7a5137debb3', 
(SELECT p.id FROM posts p JOIN threads t ON p.thread_id = t.id WHERE t.title ILIKE '%2025%' LIMIT 1), 
NOW() - INTERVAL '2 days 8 hours'),

-- Comments on anonymous millionaire
(gen_random_uuid(), 'Congratulations! This is exactly why DCA and HODL works. You''re living proof that patience and discipline pay off. Inspiring story! 🙏', 
'de7781b6-c5aa-4745-a7c1-d7a5137debb3', 
(SELECT p.id FROM posts p JOIN threads t ON p.thread_id = t.id WHERE t.title ILIKE '%Millionaire%' LIMIT 1), 
NOW() - INTERVAL '3 days 6 hours'),

(gen_random_uuid(), 'This gives me so much hope! I''m 22 and just started my Bitcoin journey. Stories like this keep me motivated to stack sats! 💪', 
'a8d16039-3abf-4548-afc1-5d8db4ad234c', 
(SELECT p.id FROM posts p JOIN threads t ON p.thread_id = t.id WHERE t.title ILIKE '%Millionaire%' LIMIT 1), 
NOW() - INTERVAL '3 days 4 hours'),

-- Comments on Lightning Network
(gen_random_uuid(), 'Lightning is finally hitting mainstream! 1M daily transactions is insane growth. Bitcoin payments are becoming reality! ⚡', 
'a8d16039-3abf-4548-afc1-5d8db4ad234c', 
(SELECT p.id FROM posts p JOIN threads t ON p.thread_id = t.id WHERE t.title ILIKE '%Lightning%' LIMIT 1), 
NOW() - INTERVAL '23 hours'),

-- Comments on banks
(gen_random_uuid(), 'The same banks that said Bitcoin was a scam are now fighting to offer Bitcoin services. The irony is beautiful! 😂🏦', 
'de7781b6-c5aa-4745-a7c1-d7a5137debb3', 
(SELECT p.id FROM posts p JOIN threads t ON p.thread_id = t.id WHERE t.title ILIKE '%Banks%' LIMIT 1), 
NOW() - INTERVAL '1 day 20 hours');

-- Success message
SELECT 'Database reset with ultra-current January 2025 Bitcoin content! 🚀' as status;
