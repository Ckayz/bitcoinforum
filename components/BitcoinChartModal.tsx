'use client';

import React from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';

interface BitcoinChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  priceHistory: number[];
  currentPrice: number;
  changePercent: number;
}

export function BitcoinChartModal({ 
  isOpen, 
  onClose, 
  priceHistory, 
  currentPrice, 
  changePercent 
}: BitcoinChartModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Add escape key listener
  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Enhanced Backdrop with blur and depth effect */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      
      {/* Modal Content */}
      <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-2xl border border-zinc-600/50 shadow-2xl max-w-5xl w-full animate-in fade-in-0 zoom-in-95 duration-500 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-b border-zinc-700/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">₿</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Bitcoin Price Analysis</h2>
                <p className="text-gray-400 text-sm">Real-time 7-day price chart</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-zinc-700/50 rounded-xl"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Large Chart */}
        <div className="p-6">
          <LargeBitcoinChart 
            priceHistory={priceHistory}
            currentPrice={currentPrice}
            changePercent={changePercent}
          />
        </div>
      </div>
    </div>
  );
}

interface LargeBitcoinChartProps {
  priceHistory: number[];
  currentPrice: number;
  changePercent: number;
}

function LargeBitcoinChart({ priceHistory, currentPrice, changePercent }: LargeBitcoinChartProps) {
  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl flex items-center justify-center border border-zinc-700">
        <span className="text-gray-400 text-lg">Chart data unavailable</span>
      </div>
    );
  }

  const minPrice = Math.min(...priceHistory);
  const maxPrice = Math.max(...priceHistory);
  const priceRange = maxPrice - minPrice;
  const isPositive = changePercent >= 0;
  
  // Create SVG path for the price line (larger dimensions)
  const pathData = priceHistory
    .map((price, index) => {
      const x = (index / (priceHistory.length - 1)) * 900; // 900px width
      const y = 320 - ((price - minPrice) / priceRange) * 280; // 280px height, inverted
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const strokeColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <div className="w-full bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl p-6 border border-zinc-700/50">
      {/* Price Info Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-2">
          <h3 className="text-white text-xl font-semibold">Bitcoin (BTC/USD)</h3>
          <div className="flex items-baseline space-x-3">
            <p className="text-4xl font-bold text-white">
              ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              <span className="text-lg font-semibold">
                {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
              </span>
              <span className="text-sm text-gray-400">(24h)</span>
            </div>
          </div>
        </div>
        <div className="text-right space-y-2">
          <div className="bg-zinc-700/50 rounded-lg p-3 space-y-1">
            <p className="text-xs text-gray-400">7-Day Range</p>
            <p className="text-sm text-green-400">High: ${Math.round(maxPrice).toLocaleString()}</p>
            <p className="text-sm text-red-400">Low: ${Math.round(minPrice).toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-600/30">
        <svg width="900" height="320" className="w-full h-80" viewBox="0 0 900 320">
          {/* Enhanced Grid */}
          <defs>
            <pattern id="modalgrid" width="60" height="40" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.4"/>
            </pattern>
            <linearGradient id="modalgradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4"/>
              <stop offset="50%" stopColor={strokeColor} stopOpacity="0.2"/>
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0"/>
            </linearGradient>
            <filter id="modalglow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#modalgrid)" />
          
          {/* Price area fill */}
          <path
            d={`${pathData} L 900 320 L 0 320 Z`}
            fill="url(#modalgradient)"
          />
          
          {/* Price line with enhanced glow */}
          <path
            d={pathData}
            fill="none"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#modalglow)"
          />
          
          {/* Interactive data points */}
          {priceHistory.map((price, index) => {
            const x = (index / (priceHistory.length - 1)) * 900;
            const y = 320 - ((price - minPrice) / priceRange) * 280;
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill={strokeColor}
                  stroke="white"
                  strokeWidth="2"
                  className="opacity-80 hover:opacity-100 transition-all duration-200 cursor-pointer hover:r-8"
                />
                <title>${Math.round(price).toLocaleString()}</title>
              </g>
            );
          })}
          
          {/* Current price indicator with enhanced animation */}
          <g>
            <circle
              cx={900}
              cy={320 - ((currentPrice - minPrice) / priceRange) * 280}
              r="8"
              fill={strokeColor}
              stroke="white"
              strokeWidth="3"
              className="animate-pulse"
            />
            <circle
              cx={900}
              cy={320 - ((currentPrice - minPrice) / priceRange) * 280}
              r="12"
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              opacity="0.5"
              className="animate-ping"
            />
          </g>
        </svg>
      </div>
      
      {/* Chart Footer */}
      <div className="flex justify-between items-center text-sm text-gray-400 mt-4">
        <span>7 days ago</span>
        <span className="text-orange-400">Live data • Updates every 30s</span>
        <span>Now</span>
      </div>
    </div>
  );
}
