import { useState, useEffect } from 'react';

interface BitcoinPrice {
  price: number;
  change24h: number;
  changePercent24h: number;
  lastUpdated: Date;
  priceHistory: number[]; // 7 days of prices
}

export function useBitcoinPrice() {
  const [priceData, setPriceData] = useState<BitcoinPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = async () => {
    try {
      // Fetch current price
      const currentResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
      );
      
      if (!currentResponse.ok) {
        throw new Error('Failed to fetch Bitcoin price');
      }
      
      const currentData = await currentResponse.json();
      const bitcoin = currentData.bitcoin;

      // Fetch 7-day price history
      const historyResponse = await fetch(
        'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=daily'
      );
      
      let priceHistory: number[] = [];
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        priceHistory = historyData.prices?.map((price: [number, number]) => price[1]) || [];
      }
      
      setPriceData({
        price: bitcoin.usd,
        change24h: bitcoin.usd_24h_change || 0,
        changePercent24h: bitcoin.usd_24h_change || 0,
        lastUpdated: new Date(),
        priceHistory
      });
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch price');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchPrice();
    
    // Set up interval for live updates (every 30 seconds)
    const interval = setInterval(fetchPrice, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { priceData, loading, error, refetch: fetchPrice };
}
