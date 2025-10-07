'use client';

import { useState } from 'react';
import { Bitcoin, TrendingUp, TrendingDown } from 'lucide-react';
import { useBitcoinPrice } from '@/hooks/useBitcoinPrice';
import { BitcoinChart } from './BitcoinChart';
import { BitcoinChartModal } from './BitcoinChartModal';

export function BitcoinPriceTicker() {
  const { priceData, loading, error } = useBitcoinPrice();
  const [showChart, setShowChart] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-400">
        <Bitcoin className="h-4 w-4 animate-pulse" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (error || !priceData) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Bitcoin className="h-4 w-4" />
        <span className="text-sm">Price unavailable</span>
      </div>
    );
  }

  const isPositive = priceData.changePercent24h >= 0;
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceData.price);

  const formattedChange = Math.abs(priceData.changePercent24h).toFixed(2);

  const handleChartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Chart clicked!'); // Debug log
    setShowModal(true);
    setShowChart(false);
  };

  const handleMouseEnter = () => {
    setShowChart(true);
  };

  const handleMouseLeave = () => {
    // Add small delay to prevent flickering
    setTimeout(() => setShowChart(false), 100);
  };

  return (
    <>
      <div className="relative">
        <div 
          className="flex items-center space-x-2 text-white cursor-pointer hover:bg-zinc-800/50 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Bitcoin className="h-4 w-4 text-orange-500" />
          <div className="flex items-center space-x-1">
            <span className="font-semibold text-sm">{formattedPrice}</span>
            <div className={`flex items-center space-x-1 text-xs ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{formattedChange}%</span>
            </div>
          </div>
        </div>

        {/* Enhanced Hover Chart */}
        {showChart && (
          <div 
            className="absolute top-full left-0 mt-2 z-50 animate-in fade-in-0 zoom-in-95 duration-300"
            onMouseEnter={() => setShowChart(true)}
            onMouseLeave={handleMouseLeave}
          >
            <BitcoinChart 
              priceHistory={priceData.priceHistory}
              currentPrice={priceData.price}
              changePercent={priceData.changePercent24h}
              isHovered={true}
              onClick={handleChartClick}
            />
          </div>
        )}
      </div>

      {/* Full-Screen Modal */}
      <BitcoinChartModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        priceHistory={priceData.priceHistory}
        currentPrice={priceData.price}
        changePercent={priceData.changePercent24h}
      />
    </>
  );
}
