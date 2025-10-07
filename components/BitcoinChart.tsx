'use client';

interface BitcoinChartProps {
  priceHistory: number[];
  currentPrice: number;
  changePercent: number;
  isHovered?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function BitcoinChart({ priceHistory, currentPrice, changePercent, isHovered = false, onClick }: BitcoinChartProps) {
  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl p-4 flex items-center justify-center transition-all duration-300 border border-zinc-700 ${
        isHovered ? 'w-96 h-48 shadow-2xl' : 'w-64 h-32 shadow-lg'
      }`}>
        <span className="text-gray-400 text-sm">Chart data unavailable</span>
      </div>
    );
  }

  const minPrice = Math.min(...priceHistory);
  const maxPrice = Math.max(...priceHistory);
  const priceRange = maxPrice - minPrice;
  
  // Responsive dimensions based on hover state
  const width = isHovered ? 360 : 240;
  const height = isHovered ? 120 : 80;
  
  // Create SVG path for the price line
  const pathData = priceHistory
    .map((price, index) => {
      const x = (index / (priceHistory.length - 1)) * width;
      const y = height - ((price - minPrice) / priceRange) * (height * 0.75);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const isPositive = changePercent >= 0;
  const strokeColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <div 
      className={`bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl p-4 border transition-all duration-300 cursor-pointer hover:scale-105 ${
        isHovered 
          ? 'w-96 h-48 shadow-2xl border-orange-500/50 bg-gradient-to-br from-zinc-700 to-zinc-800' 
          : 'w-64 h-32 shadow-lg border-zinc-700 hover:border-zinc-600'
      }`}
      onClick={(e) => onClick?.(e)}
    >
      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="text-white text-sm font-semibold">Bitcoin 7D</span>
          {isHovered && (
            <p className="text-xs text-gray-400 mt-1">
              ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          )}
        </div>
        <div className="text-right">
          <span className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </span>
          {isHovered && (
            <p className="text-xs text-gray-400 mt-1">24h change</p>
          )}
        </div>
      </div>
      
      <div className="relative">
        <svg width={width} height={height} className="w-full" style={{ height: isHovered ? '120px' : '80px' }}>
          {/* Enhanced Grid */}
          <defs>
            <pattern id={`grid-${isHovered ? 'large' : 'small'}`} width="30" height="20" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.4"/>
            </pattern>
            <linearGradient id={`chartgradient-${isHovered ? 'large' : 'small'}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3"/>
              <stop offset="50%" stopColor={strokeColor} stopOpacity="0.1"/>
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0"/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <rect width="100%" height="100%" fill={`url(#grid-${isHovered ? 'large' : 'small'})`} />
          
          {/* Price area fill */}
          <path
            d={`${pathData} L ${width} ${height} L 0 ${height} Z`}
            fill={`url(#chartgradient-${isHovered ? 'large' : 'small'})`}
          />
          
          {/* Price line with glow effect */}
          <path
            d={pathData}
            fill="none"
            stroke={strokeColor}
            strokeWidth={isHovered ? "3" : "2"}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={isHovered ? "url(#glow)" : "none"}
          />
          
          {/* Data points (only show on hover) */}
          {isHovered && priceHistory.map((price, index) => {
            const x = (index / (priceHistory.length - 1)) * width;
            const y = height - ((price - minPrice) / priceRange) * (height * 0.75);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={strokeColor}
                className="opacity-70 hover:opacity-100 transition-opacity"
                stroke="white"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Current price dot with pulse animation */}
          <circle
            cx={width}
            cy={height - ((currentPrice - minPrice) / priceRange) * (height * 0.75)}
            r={isHovered ? "5" : "3"}
            fill={strokeColor}
            stroke="white"
            strokeWidth="2"
            className="animate-pulse"
          />
        </svg>
      </div>
      
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>${Math.round(minPrice).toLocaleString()}</span>
        <span>${Math.round(maxPrice).toLocaleString()}</span>
      </div>
      
      {isHovered && (
        <div className="text-center mt-3 animate-pulse">
          <span className="text-xs text-orange-400 font-medium">🔍 Click to expand full view</span>
        </div>
      )}
    </div>
  );
}
