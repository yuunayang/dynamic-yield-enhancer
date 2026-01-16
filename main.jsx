import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Info, 
  Activity, 
  Wallet, 
  ArrowRight,
  Target,
  Clock,
  X,
  ShieldAlert,
  Lock,
  ChevronUp,
  Zap,
  BarChart3,
  Settings,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Trophy
} from 'lucide-react';

const TradingApp = () => {
  // 原始设计尺寸
  const DESIGN_WIDTH = 390;
  const DESIGN_HEIGHT = 844;
  
  // 自适应缩放
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  
  // 模拟实时价格波动
  const [currentPrice, setCurrentPrice] = useState(64230.50);
  const [priceChange, setPriceChange] = useState(2.45);
  
  // 核心状态
  const [direction, setDirection] = useState('long');
  const [riskLevel, setRiskLevel] = useState(20);
  const [principal, setPrincipal] = useState(1000);
  
  // 视图状态
  const [showModal, setShowModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [viewState, setViewState] = useState('trading'); // 'trading' | 'position'
  
  // K线悬停状态
  const [hoveredCandle, setHoveredCandle] = useState(null);
  
  // 持仓数据
  const [positionData, setPositionData] = useState(null);
  
  // 弹窗拖拽状态
  const [dragStartY, setDragStartY] = useState(null);
  const [modalOffset, setModalOffset] = useState(0);
  
  // 滚动容器和底部锚点 ref
  const scrollContainerRef = useRef(null);
  const positionPanelRef = useRef(null);

  // 模拟价格跳动
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 50;
      setCurrentPrice(prev => prev + change);
      setPriceChange(prev => prev + (Math.random() - 0.5) * 0.1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // 自适应缩放计算
  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const availableWidth = container.clientWidth;
      const availableHeight = container.clientHeight;
      
      // 计算宽度和高度的缩放比例
      const scaleX = availableWidth / DESIGN_WIDTH;
      const scaleY = availableHeight / DESIGN_HEIGHT;
      
      // 取较小值以保持比例，并设置上下限
      let newScale = Math.min(scaleX, scaleY);
      newScale = Math.max(0.4, Math.min(1.2, newScale)); // 最小 0.4x，最大 1.2x
      
      setScale(newScale);
    };

    calculateScale();
    
    // 监听窗口大小变化
    window.addEventListener('resize', calculateScale);
    
    // 使用 ResizeObserver 监听容器大小变化（更精确）
    const resizeObserver = new ResizeObserver(calculateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', calculateScale);
      resizeObserver.disconnect();
    };
  }, []);

  // 模拟K线数据
  const generateCandlesticks = () => {
    const candles = [];
    let price = 63500;
    for (let i = 0; i < 40; i++) {
      const open = price;
      const change = (Math.random() - 0.48) * 400;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 150;
      const low = Math.min(open, close) - Math.random() * 150;
      candles.push({ open, close, high, low, isGreen: close > open });
      price = close;
    }
    return candles;
  };
  
  const [candlesticks] = useState(generateCandlesticks);

  // 金融逻辑计算
  const priceGapPercentage = 0.002 + (riskLevel / 100) * 0.05; 
  const strikePrice = direction === 'long' 
    ? currentPrice * (1 + priceGapPercentage)
    : currentPrice * (1 - priceGapPercentage);
  const targetROI = 0.1 + Math.pow(riskLevel / 100, 2) * 1.9;
  const multiplier = 1 + targetROI;
  const winProbability = Math.max(20, 65 - riskLevel * 0.4);
  const potentialProfit = principal * multiplier;

  // 可用余额
  const availableBalance = 10000;
  
  // 验证逻辑
  const MIN_STAKE = 10;
  const MAX_STAKE = 99999;
  
  const getStakeError = () => {
    if (principal < MIN_STAKE) return `Minimum stake is $${MIN_STAKE}`;
    if (principal > MAX_STAKE) return `Maximum stake is $${MAX_STAKE.toLocaleString()}`;
    if (principal > availableBalance) return `Exceeds available balance`;
    return null;
  };
  
  const stakeError = getStakeError();
  const isOrderValid = principal >= MIN_STAKE && principal <= MAX_STAKE && principal <= availableBalance;

  // 辅助函数
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };
  const formatPercent = (val) => {
    return (val * 100).toFixed(2) + '%';
  };

  // 下单处理
  const handlePlaceOrder = () => {
    if (!isOrderValid) return;
    
    setPositionData({
      direction,
      entryPrice: currentPrice,
      strikePrice,
      principal,
      targetROI,
      multiplier,
      timestamp: new Date(),
    });
    setShowModal(false);
    setViewState('position');
    
    // 延迟滚动到底部，等待 Position Panel 渲染完成
    setTimeout(() => {
      if (positionPanelRef.current) {
        positionPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 100);
  };

  // 平仓处理
  const handleClosePosition = () => {
    setPositionData(null);
    setViewState('trading');
  };

  // 弹窗拖拽处理
  const handleDragStart = (e) => {
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    setDragStartY(clientY);
  };

  const handleDragMove = (e) => {
    if (dragStartY === null) return;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    const diff = clientY - dragStartY;
    if (diff > 0) {
      setModalOffset(diff);
    }
  };

  const handleDragEnd = () => {
    if (modalOffset > 100) {
      setShowModal(false);
    }
    setDragStartY(null);
    setModalOffset(0);
  };

  // 动态颜色
  const themeColorText = direction === 'long' ? 'text-lime-400' : 'text-red-400';
  const themeColorHoverText = direction === 'long' ? 'hover:text-lime-400' : 'hover:text-red-400';
  const themeColorAccent = direction === 'long' 
    ? 'accent-lime-400 hover:accent-lime-300 focus:ring-lime-400/20' 
    : 'accent-red-400 hover:accent-red-300 focus:ring-red-400/20';

  // 计算持仓收益
  const calculatePositionPnL = () => {
    if (!positionData) return { pnl: 0, pnlPercent: 0, currentMultiplier: 1, progress: 0 };
    
    const priceDiff = positionData.direction === 'long' 
      ? currentPrice - positionData.entryPrice
      : positionData.entryPrice - currentPrice;
    
    const pnlPercent = (priceDiff / positionData.entryPrice) * 100;
    const pnl = positionData.principal * (pnlPercent / 100);
    
    // 计算当前所在的收益倍数区间
    const targetDiff = Math.abs(positionData.strikePrice - positionData.entryPrice);
    const currentProgress = Math.max(0, priceDiff) / targetDiff;
    const currentMultiplier = 1 + (positionData.targetROI * Math.min(1, currentProgress));
    
    return { pnl, pnlPercent, currentMultiplier, progress: Math.min(100, currentProgress * 100) };
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-screen bg-transparent flex items-center justify-center overflow-hidden"
    >
      {/* Scaled Container */}
      <div 
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* iPhone 14 Frame */}
        <div className="w-[390px] h-[844px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 rounded-[50px] border-[8px] border-zinc-800 overflow-hidden relative shadow-2xl flex flex-col">
        
        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[126px] h-[37px] bg-black rounded-full z-50"></div>
        
        {/* Status Bar - Fixed */}
        <div className="h-12 px-8 flex items-end justify-between text-white text-xs font-medium pb-1 flex-shrink-0">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              <div className="w-1 h-2 bg-white rounded-sm"></div>
              <div className="w-1 h-2.5 bg-white rounded-sm"></div>
              <div className="w-1 h-3 bg-white rounded-sm"></div>
              <div className="w-1 h-3.5 bg-white rounded-sm"></div>
            </div>
            <span className="ml-1">5G</span>
            <div className="w-6 h-3 border border-white rounded-sm ml-1 relative">
              <div className="absolute inset-0.5 right-1 bg-white rounded-sm"></div>
              <div className="absolute -right-0.5 top-1 w-0.5 h-1 bg-white rounded-r-sm"></div>
            </div>
          </div>
        </div>

        {/* App Header - Fixed */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-zinc-800/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">₿</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-[15px]">BTC/USDT</span>
                <span className="text-[11px] px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">Perp</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono text-sm">{formatCurrency(currentPrice)}</span>
                <span className={`text-[11px] flex items-center ${priceChange >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                  {priceChange >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-zinc-500 hover:text-zinc-300">
              <Bell size={20} />
            </button>
            <button className="text-zinc-500 hover:text-zinc-300">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto pb-36 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
        {/* Chart Area */}
        <div className="h-[260px] px-2 py-3 relative flex-shrink-0 bg-transparent z-20">
          {/* Chart Content Container with Overflow Hidden */}
          <div className="absolute inset-0 overflow-hidden px-2 py-3">
            {/* Time tabs */}
            <div className="flex items-center gap-1 px-2 mb-4 relative z-10">
            {['1m', '5m', '15m', '1H', '4H', '1D'].map((t, i) => (
              <button 
                key={t}
                className={`flex-1 py-1.5 text-[10px] font-medium rounded-lg transition-all ${
                  i === 3 
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm ring-1 ring-white/5' 
                    : 'text-zinc-500 hover:text-zinc-400 hover:bg-zinc-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Candlestick Chart */}
          <div className="h-[200px] flex items-end justify-between gap-0.5 pl-2 pr-14 relative z-0">
            {/* Grid lines */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="border-b border-zinc-800/20 h-1/4 w-full absolute top-1/4"></div>
              <div className="border-b border-zinc-800/20 h-1/4 w-full absolute top-2/4"></div>
              <div className="border-b border-zinc-800/20 h-1/4 w-full absolute top-3/4"></div>
            </div>

            {candlesticks.map((candle, i) => {
              const range = 2000;
              const basePrice = 63000;
              const highPercent = ((candle.high - basePrice) / range) * 100;
              const lowPercent = ((candle.low - basePrice) / range) * 100;
              const bodyTop = Math.max(candle.open, candle.close);
              const bodyBottom = Math.min(candle.open, candle.close);
              const bodyTopPercent = ((bodyTop - basePrice) / range) * 100;
              const bodyBottomPercent = ((bodyBottom - basePrice) / range) * 100;
              
              return (
                <div 
                  key={i} 
                  className="flex-1 flex flex-col items-center relative h-full cursor-crosshair group"
                  onMouseEnter={() => setHoveredCandle(i)}
                  onMouseLeave={() => setHoveredCandle(null)}
                >
                  {/* Hover highlight */}
                  <div className={`absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  {/* Wick */}
                  <div 
                    className={`w-px absolute ${candle.isGreen ? 'bg-lime-500/60' : 'bg-red-500/60'}`}
                    style={{
                      bottom: `${lowPercent}%`,
                      height: `${highPercent - lowPercent}%`
                    }}
                  ></div>
                  {/* Body */}
                  <div 
                    className={`w-full absolute rounded-sm ${candle.isGreen ? 'bg-lime-500' : 'bg-red-500'}`}
                    style={{
                      bottom: `${bodyBottomPercent}%`,
                      height: `${Math.max(1, bodyTopPercent - bodyBottomPercent)}%`
                    }}
                  ></div>
                </div>
              );
            })}
          </div>
          
          {/* Price scale */}
          <div className="absolute right-3 top-12 bottom-4 flex flex-col justify-between text-[10px] text-zinc-500 font-mono pointer-events-none z-10">
            <span>65,000</span>
            <span>64,500</span>
            <span>64,000</span>
            <span>63,500</span>
            <span>63,000</span>
          </div>
          </div>
          
          {/* Hover Tooltip - Outside overflow-hidden container */}
          {hoveredCandle !== null && (
            <div className="absolute top-14 left-4 bg-zinc-900/95 backdrop-blur border border-zinc-800 rounded-xl p-3 z-30 shadow-2xl ring-1 ring-black/20 pointer-events-none">
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[10px]">
                <span className="text-zinc-500">Open</span>
                <span className="text-zinc-200 font-mono text-right">{candlesticks[hoveredCandle].open.toFixed(2)}</span>
                <span className="text-zinc-500">High</span>
                <span className="text-lime-400 font-mono text-right">{candlesticks[hoveredCandle].high.toFixed(2)}</span>
                <span className="text-zinc-500">Low</span>
                <span className="text-red-400 font-mono text-right">{candlesticks[hoveredCandle].low.toFixed(2)}</span>
                <span className="text-zinc-500">Close</span>
                <span className={`font-mono text-right ${candlesticks[hoveredCandle].isGreen ? 'text-lime-400' : 'text-red-400'}`}>
                  {candlesticks[hoveredCandle].close.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Order Book & Market Info */}
        <div className="px-5 py-6 border-t border-zinc-900 bg-transparent relative z-10">
          {/* Order Book Header */}
          <div className="flex justify-between items-end mb-4 px-1">
            <span className="text-xs text-zinc-300 font-semibold tracking-wide">Order Book</span>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-zinc-500 font-medium">Spread <span className="text-zinc-400 font-mono ml-1">0.01%</span></span>
              <span className="text-[10px] text-zinc-500 font-medium">Depth <span className="text-zinc-400 font-mono ml-1">±0.1%</span></span>
            </div>
          </div>
          
          {/* Order Book Table Header */}
          <div className="flex gap-4 mb-2.5 px-1">
            <div className="flex-1 flex justify-between text-[10px] font-medium text-zinc-600">
              <span>Size (BTC)</span>
              <span>Bid</span>
            </div>
            <div className="flex-1 flex justify-between text-[10px] font-medium text-zinc-600">
              <span>Ask</span>
              <span>Size (BTC)</span>
            </div>
          </div>
          
          {/* Order Book Data */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-1.5">
              {[
                { size: 2.45, price: 64228.50, depth: 0.85 },
                { size: 1.82, price: 64225.00, depth: 0.65 },
                { size: 3.21, price: 64220.00, depth: 0.92 },
                { size: 0.95, price: 64215.50, depth: 0.35 },
                { size: 1.56, price: 64210.00, depth: 0.55 },
                { size: 2.88, price: 64205.00, depth: 0.78 },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between relative h-6 group">
                  <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-lime-500/40 rounded-full" style={{ width: `${row.depth * 100}%` }}></div>
                  <span className="text-[11px] text-zinc-400 font-mono relative z-10 pl-1">{row.size.toFixed(2)}</span>
                  <span className="text-[11px] text-lime-400/90 font-mono relative z-10 pr-1 group-hover:text-lime-400 transition-colors">{row.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 space-y-1.5">
              {[
                { size: 1.95, price: 64232.00, depth: 0.60 },
                { size: 2.67, price: 64235.50, depth: 0.75 },
                { size: 1.23, price: 64240.00, depth: 0.42 },
                { size: 3.45, price: 64245.00, depth: 0.95 },
                { size: 2.01, price: 64250.00, depth: 0.58 },
                { size: 1.78, price: 64255.50, depth: 0.52 },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between relative h-6 group">
                  <div className="absolute left-0 bottom-0 right-0 h-0.5 bg-red-500/40 rounded-full" style={{ width: `${row.depth * 100}%` }}></div>
                  <span className="text-[11px] text-red-400/90 font-mono relative z-10 pl-1 group-hover:text-red-400 transition-colors">{row.price.toFixed(2)}</span>
                  <span className="text-[11px] text-zinc-400 font-mono relative z-10 pr-1">{row.size.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Market Stats */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-800/60 flex flex-col justify-center">
              <div className="text-[10px] font-medium text-zinc-500 mb-1">24h Volume</div>
              <div className="text-xs text-zinc-200 font-mono font-medium">$2.84B</div>
            </div>
            <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-800/60 flex flex-col justify-center">
              <div className="text-[10px] font-medium text-zinc-500 mb-1">24h High</div>
              <div className="text-xs text-lime-400/90 font-mono font-medium">$65,420</div>
            </div>
            <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-800/60 flex flex-col justify-center">
              <div className="text-[10px] font-medium text-zinc-500 mb-1">24h Low</div>
              <div className="text-xs text-red-400/90 font-mono font-medium">$62,180</div>
            </div>
          </div>
          
          {/* Position Panel - inline below market stats */}
          {viewState === 'position' && positionData && (
            <div ref={positionPanelRef} className="mt-6 bg-zinc-900/80 backdrop-blur-sm rounded-2xl border border-zinc-800 p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              {(() => {
                const { pnl, pnlPercent, currentMultiplier, progress } = calculatePositionPnL();
                const isProfit = pnl >= 0;

  return (
                  <>
                    {/* Position Header */}
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${positionData?.direction === 'long' ? 'bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'} animate-pulse`}></div>
                        <span className="text-xs font-medium text-zinc-300">Active Position</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                          positionData?.direction === 'long' 
                            ? 'bg-lime-500/10 text-lime-400 border-lime-500/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {positionData?.direction === 'long' ? 'LONG' : 'SHORT'}
                        </span>
                      </div>
                      <button 
                        onClick={handleClosePosition}
                        className="text-[10px] font-medium text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-700/50 hover:border-zinc-600 bg-zinc-800/50 hover:bg-zinc-800 transition-all"
                      >
                        Close Position
                      </button>
                    </div>

                    {/* Multiplier Display */}
                    <div className="bg-zinc-950/80 rounded-xl p-4 mb-4 border border-zinc-800/60 relative z-10">
                      <div className="flex items-end justify-between mb-3">
                        <div>
                          <div className="text-[10px] font-medium text-zinc-500 mb-1">Current Multiplier</div>
                          <div className={`text-2xl font-mono font-bold tracking-tight ${isProfit ? 'text-lime-400' : 'text-red-400'}`}>
                            {currentMultiplier.toFixed(2)}x
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-medium text-zinc-500 mb-1">Target Zone</div>
                          <div className="text-base font-mono font-bold text-amber-400 flex items-center justify-end gap-1.5">
                            <Trophy size={14} className="text-amber-500" />
                            {positionData?.multiplier.toFixed(2)}x
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="relative pt-1">
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ease-out relative ${
                              progress >= 100 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 
                              isProfit ? 'bg-lime-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                          </div>
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] font-medium text-zinc-500">
                          <span>Entry</span>
                          <span className="flex items-center gap-1 text-amber-500/80">
                            <Flame size={10} />
                            Breakout
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* PnL Details */}
                    <div className="grid grid-cols-3 gap-3 text-center relative z-10">
                      <div className="bg-zinc-950/50 rounded-xl p-2.5 border border-zinc-800/30">
                        <div className="text-[10px] font-medium text-zinc-500 mb-1">Entry Price</div>
                        <div className="text-xs text-zinc-200 font-mono font-medium">{formatCurrency(positionData?.entryPrice || 0)}</div>
                      </div>
                      <div className="bg-zinc-950/50 rounded-xl p-2.5 border border-zinc-800/30">
                        <div className="text-[10px] font-medium text-zinc-500 mb-1">Unrealized P&L</div>
                        <div className={`text-xs font-mono font-bold ${isProfit ? 'text-lime-400' : 'text-red-400'}`}>
                          {isProfit ? '+' : ''}{formatCurrency(pnl)}
                        </div>
                      </div>
                      <div className="bg-zinc-950/50 rounded-xl p-2.5 border border-zinc-800/30">
                        <div className="text-[10px] font-medium text-zinc-500 mb-1">Target Strike</div>
                        <div className={`text-xs font-mono font-medium ${positionData?.direction === 'long' ? 'text-lime-400/90' : 'text-red-400/90'}`}>
                          {formatCurrency(positionData?.strikePrice || 0)}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
        </div>

        {/* Bottom Section - Trading or Position */}
        {viewState === 'trading' ? (
          /* Bottom Trading Bar - positioned higher */
          <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent">
            {/* Structured Entry */}
            <button 
              onClick={() => setShowModal(true)}
              className="w-full py-3.5 rounded-xl border border-amber-500/50 bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center gap-2 text-amber-400 hover:text-amber-300 hover:border-amber-400 transition-all group shadow-lg shadow-black/50"
            >
              <Zap size={18} className="text-amber-500" />
              <span className="text-sm font-semibold">Super Trade</span>
              <ChevronUp size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        ) : null}

        {/* Structured Strategy Modal */}
        {showModal && (
          <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
            <div 
              className="absolute inset-0" 
              onClick={() => setShowModal(false)}
            ></div>
            
            <div 
              className="relative w-full bg-zinc-900 border-t border-zinc-700 rounded-t-3xl shadow-2xl z-10 max-h-[85%] overflow-hidden transition-transform duration-150"
              style={{ transform: `translateY(${modalOffset}px)` }}
            >
              {/* Modal Handle - Click or drag to close */}
              <div 
                className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
                onClick={() => setShowModal(false)}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
              >
                <div className="w-10 h-1 bg-zinc-600 rounded-full hover:bg-zinc-500 transition-colors"></div>
              </div>
              
              {/* Modal Header */}
              <div className="px-5 pb-3 pt-2 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">BTC/USDT</span>
                    <span className="bg-zinc-800 text-[10px] px-1.5 py-0.5 rounded text-zinc-400">Paper Trading</span>
            </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-lg font-mono text-white font-medium">
                {formatCurrency(currentPrice)}
              </span>
                    <span className="text-[10px] text-zinc-400 flex items-center">
                      <Activity size={10} className="mr-0.5 text-lime-400 animate-pulse" /> Live
              </span>
            </div>
          </div>
          <div className="text-right">
                  <div className="text-[10px] text-zinc-500 mb-0.5">24h</div>
                  <div className={`font-mono text-xs ${direction === 'long' ? 'text-lime-400' : 'text-red-400'}`}>
                    {direction === 'long' ? '+2.45%' : '-1.20%'}
                  </div>
          </div>
        </div>

              {/* Modal Body */}
              <div className="px-5 py-3 space-y-3">
                {/* Direction Selection */}
                <div className="bg-zinc-950 p-0.5 rounded-lg flex border border-zinc-800">
            <button 
              onClick={() => setDirection('long')}
                    className={`flex-1 py-2.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 border ${
                direction === 'long' 
                        ? 'bg-zinc-800 text-lime-400 shadow-lg border-zinc-700' 
                        : 'text-zinc-500 hover:text-zinc-300 border-transparent'
              }`}
            >
                    <TrendingUp size={12} /> Price Rising (Long)
            </button>
            <button 
              onClick={() => setDirection('short')}
                    className={`flex-1 py-2.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 border ${
                direction === 'short' 
                        ? 'bg-zinc-800 text-red-400 shadow-lg border-zinc-700' 
                        : 'text-zinc-500 hover:text-zinc-300 border-transparent'
              }`}
            >
                    <TrendingDown size={12} /> Price Falling (Short)
            </button>
          </div>

                {/* Price Target Setup */}
                <div className="relative h-24 bg-zinc-950/50 rounded-xl border border-zinc-800/50 p-3 flex flex-col justify-center overflow-hidden">
                  <div className="absolute top-1.5 left-3 text-[8px] uppercase tracking-wider text-zinc-700 font-bold">
                    YOUR PREDICTION
            </div>
            
                  <div className="relative w-full h-1.5 mt-4 z-10">
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-zinc-500 rounded-full z-20"
                      style={{ left: '10%' }}
                    ></div>
                <div 
                      className={`absolute top-1/2 -translate-y-1/2 h-0.5 rounded-full ${
                        direction === 'long' ? 'bg-lime-500/40' : 'bg-red-500/40'
                      }`}
                      style={{ left: '11%', width: `${Math.max(0, riskLevel * 0.8 - 1)}%` }}
                ></div>
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center z-20"
                      style={{ left: `${11 + Math.max(0, riskLevel * 0.8 - 1)}%` }}
                    >
                      <div className={`w-0.5 h-4 rounded-full ${
                        direction === 'long' ? 'bg-lime-400/60' : 'bg-red-400/60'
                      }`}></div>
              </div>
            </div>

                  <div className="flex justify-between mt-2 text-[10px] font-mono relative z-10">
              <div className="text-zinc-400">
                      <div className="mb-0.5 flex items-center gap-1">
                        Current Price <Lock size={10} className="text-amber-500" />
                      </div>
                      <div className="text-white text-[11px]">{formatCurrency(currentPrice)}</div>
              </div>
              <div className="text-right">
                      <div className="mb-0.5 text-zinc-500 flex items-center justify-end gap-0.5">
                        Target Price
                </div>
                      <div className={`text-[11px] ${themeColorText}`}>
                  {formatCurrency(strikePrice)}
                </div>
                      <div className={`text-[9px] ${direction === 'long' ? 'text-lime-400' : 'text-red-400'}`}>
                        {direction === 'long' ? '+' : '-'}{(priceGapPercentage * 100).toFixed(2)}% {direction === 'long' ? 'higher' : 'lower'}
                      </div>
              </div>
            </div>
          </div>
                
                {/* Hint text - outside the box */}
                <div className={`text-[9px] -mt-2 ${direction === 'long' ? 'text-lime-400/70' : 'text-red-400/70'}`}>
                  {direction === 'long' 
                    ? 'You win if BTC rises above your target price within 24 hours'
                    : 'You win if BTC falls below your target price within 24 hours'
                  }
                </div>

                {/* Risk Slider */}
          <div>
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs font-medium text-zinc-400">Difficulty Level</label>
                <button 
                  onClick={() => setShowInfoModal(true)}
                        className={`text-zinc-600 ${themeColorHoverText} transition-colors`}
                >
                        <Info size={12} />
                </button>
              </div>
              <div className="text-right">
                      <span className={`text-lg font-mono font-bold ${themeColorText}`}>+{(targetROI * 100).toFixed(0)}%</span>
                      <span className="text-[10px] text-zinc-500 block">Win Rate</span>
              </div>
            </div>
            
                  <div className="relative h-8 flex items-center px-3">
                    <div className="absolute left-3 right-3 h-1.5 bg-zinc-800 rounded-full"></div>
                    <div 
                      className={`absolute left-3 h-1.5 rounded-full transition-all ${direction === 'long' ? 'bg-lime-500/40' : 'bg-red-500/40'}`}
                      style={{ width: `calc(${riskLevel}% * 0.94)` }}
                    ></div>
                    <div 
                      className={`absolute w-7 h-7 rounded-full border-2 flex items-center justify-center pointer-events-none transition-all ${
                        direction === 'long' ? 'bg-lime-500 border-lime-400' : 'bg-red-500 border-red-400'
                      }`}
                      style={{ 
                        left: `calc(${riskLevel}% * 0.94 + 12px - 14px)`,
                        boxShadow: direction === 'long' 
                          ? '0 2px 10px rgba(163, 230, 53, 0.5)' 
                          : '0 2px 10px rgba(248, 113, 113, 0.5)'
                      }}
                    >
                      <span className="text-[9px] font-bold text-white/90 tracking-tighter select-none">|||</span>
                    </div>
              <input
                type="range"
                min="0"
                max="100"
                value={riskLevel}
                onChange={(e) => setRiskLevel(Number(e.target.value))}
                      className="absolute left-3 right-3 h-8 opacity-0 cursor-grab active:cursor-grabbing z-10"
              />
            </div>
                  <div className="flex justify-between text-[9px] text-zinc-600 uppercase font-bold tracking-wider mt-0.5 px-3">
              <span>Easier</span>
              <span>Harder</span>
            </div>
          </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-zinc-900/50 p-2.5 rounded-md border border-zinc-800/50">
                    <div className="text-zinc-500 mb-0.5">Success Rate</div>
                    <div className="text-zinc-300 font-mono text-sm">{winProbability.toFixed(1)}%</div>
                    <div className={`text-[8px] mt-0.5 ${winProbability >= 50 ? 'text-lime-400/70' : winProbability >= 35 ? 'text-amber-400/70' : 'text-red-400/70'}`}>
                      {winProbability >= 50 ? 'High Chance' : winProbability >= 35 ? 'Medium Chance' : 'Low Chance'}
                    </div>
                  </div>
                  <div className="bg-zinc-900/50 p-2.5 rounded-md border border-zinc-800/50">
                    <div className="text-zinc-500 mb-0.5">Time Limit</div>
                    <div className="text-zinc-300 font-mono text-sm flex items-center gap-0.5">
                      <Clock size={10} /> 24 Hours
                    </div>
                    <div className="text-[8px] text-zinc-500 mt-0.5">
                      Expires: {(() => {
                        const expiry = new Date();
                        expiry.setHours(expiry.getHours() + 24);
                        return expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + 
                               expiry.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                      })()}
                    </div>
                  </div>
                </div>

                {/* Stake Amount Input */}
                <div className={`bg-zinc-950 rounded-lg p-3 border transition-colors ${stakeError ? 'border-red-500/50' : 'border-zinc-800'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Wallet size={14} />
                      <span className="text-xs">Stake Amount</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500 text-xs">$</span>
                      <input 
                        type="number" 
                        value={principal}
                        onChange={(e) => setPrincipal(Number(e.target.value))}
                        className={`bg-transparent text-right font-mono text-sm focus:outline-none w-28 ${stakeError ? 'text-red-400' : 'text-white'}`}
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[9px] text-zinc-500">Available: <span className="text-zinc-400 font-mono">${availableBalance.toLocaleString()}.00</span></span>
                    {stakeError && (
                      <span className="text-[9px] text-red-400">{stakeError}</span>
                    )}
                  </div>
            </div>
          </div>

              {/* Modal Footer */}
              <div className="px-5 pb-10 pt-3">
          <button 
            disabled={!isOrderValid}
                  onClick={handlePlaceOrder}
                  className={`w-full font-bold py-3 rounded-xl transition-all flex items-center justify-between px-4 group text-sm ${
              isOrderValid 
                      ? direction === 'long'
                        ? 'bg-white hover:bg-zinc-100 border-2 border-lime-500 text-lime-600 shadow-lg cursor-pointer'
                        : 'bg-white hover:bg-zinc-100 border-2 border-red-500 text-red-600 shadow-lg cursor-pointer'
                      : 'bg-zinc-800 text-zinc-600 cursor-not-allowed border-2 border-zinc-700'
            }`}
          >
            <div className="flex flex-col items-start">
                    <span className={`text-[8px] uppercase tracking-wider ${isOrderValid ? 'opacity-70' : 'opacity-50'}`}>Potential Payout</span>
                    <span className="font-mono text-sm">{formatCurrency(potentialProfit)}</span>
            </div>
                  <div className="flex items-center gap-1.5">
                    <span>{isOrderValid ? 'Confirm' : (stakeError ? 'Fix Errors' : 'Enter Stake')}</span>
                    <ArrowRight size={14} className={`transition-transform ${isOrderValid ? 'group-hover:translate-x-1' : ''}`} />
            </div>
          </button>
                <p className="text-center text-[9px] text-zinc-600 mt-3 leading-relaxed px-2">
                  {direction === 'long' 
                    ? `Risk: If BTC is below ${formatCurrency(strikePrice)} when time expires, you lose your stake. This is paper trading only.`
                    : `Risk: If BTC is above ${formatCurrency(strikePrice)} when time expires, you lose your stake. This is paper trading only.`
                  }
          </p>
        </div>
      </div>
          </div>
        )}

        {/* Info Modal */}
      {showInfoModal && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowInfoModal(false)}></div>
            <div className="bg-zinc-900 border border-zinc-700 p-5 rounded-2xl w-full max-w-xs shadow-2xl relative z-10">
            <button 
              onClick={() => setShowInfoModal(false)}
              className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
            
            <div className={`flex items-center gap-2 mb-3 ${themeColorText}`}>
              <ShieldAlert size={18} />
                <h3 className="font-bold text-sm">Difficulty Level</h3>
            </div>
            
            <div className="space-y-3 text-xs text-zinc-400 leading-relaxed">
              <p>
                  <strong className="text-zinc-200">Higher Difficulty = Higher Reward.</strong><br/>
                  Moving the slider increases the distance between Current Price and Target Price.
              </p>
              <p>
                  This boosts your potential <span className={themeColorText}>Win Rate</span>, but reduces the success rate.
              </p>
            </div>

            <button 
              onClick={() => setShowInfoModal(false)}
              className="w-full mt-5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium py-2.5 rounded-lg transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full"></div>
      </div>
      </div>
    </div>
  );
};

export default TradingApp;
