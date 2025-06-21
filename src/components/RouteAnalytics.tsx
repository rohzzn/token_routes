"use client";

import React, { useState, useEffect } from 'react';
import type { TokenInfo } from './TokenSelector';

interface RouteAnalyticsProps {
  inputToken: TokenInfo | null;
  outputToken: TokenInfo | null;
}

type RouteMetrics = {
  routeCount: number;
  bestOutAmount: string;
  worstOutAmount: string;
  averageOutAmount: string;
  priceImpactRange: {
    min: number;
    max: number;
    avg: number;
  };
  protocolUsage: Record<string, number>;
  hopCounts: Record<number, number>;
  historicalData: {
    timestamp: number;
    rate: number;
  }[];
}

const RouteAnalytics: React.FC<RouteAnalyticsProps> = ({ inputToken, outputToken }) => {
  const [metrics, setMetrics] = useState<RouteMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  // Fetch analytics data when tokens change or timeframe changes
  useEffect(() => {
    if (!inputToken || !outputToken) {
      setMetrics(null);
      return;
    }

    const fetchRouteMetrics = async () => {
      setLoading(true);
      
      try {
        // In a real implementation, you would fetch this data from Jupiter's API
        // For now, we'll simulate the data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Generate mock data based on selected tokens
        const mockMetrics: RouteMetrics = {
          routeCount: Math.floor(Math.random() * 5) + 2,
          bestOutAmount: (10000000 + Math.random() * 500000).toString(),
          worstOutAmount: (9500000 + Math.random() * 300000).toString(),
          averageOutAmount: (9800000 + Math.random() * 100000).toString(),
          priceImpactRange: {
            min: 0.05 + Math.random() * 0.3,
            max: 0.8 + Math.random() * 2,
            avg: 0.4 + Math.random() * 0.8
          },
          protocolUsage: {
            'Orca': Math.round(Math.random() * 40),
            'Raydium': Math.round(Math.random() * 30),
            'Meteora': Math.round(Math.random() * 20),
            'Jupiter': Math.round(Math.random() * 10)
          },
          hopCounts: {
            1: Math.round(Math.random() * 40 + 30),
            2: Math.round(Math.random() * 30),
            3: Math.round(Math.random() * 15),
            4: Math.round(Math.random() * 5)
          },
          historicalData: Array.from({ length: 24 }, (_, i) => {
            const baseRate = 10 + Math.random() * 2;
            const variation = (Math.random() - 0.5) * 0.8;
            return {
              timestamp: Date.now() - (23 - i) * 3600 * 1000,
              rate: baseRate + variation
            };
          })
        };
        
        // Calculate total for percentage normalization
        const total = Object.values(mockMetrics.protocolUsage).reduce((a, b) => a + b, 0);
        if (total > 0) {
          Object.keys(mockMetrics.protocolUsage).forEach(key => {
            mockMetrics.protocolUsage[key] = Math.round((mockMetrics.protocolUsage[key] / total) * 100);
          });
        }
        
        setMetrics(mockMetrics);
      } catch (error) {
        console.error('Error fetching route analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRouteMetrics();
  }, [inputToken, outputToken, timeframe]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-3"></div>
          <span className="text-slate-300">Analyzing routes...</span>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-400">
          {inputToken && outputToken
            ? `Select timeframe and amount to analyze routes between ${inputToken.symbol} and ${outputToken.symbol}`
            : 'Select tokens to analyze routes'}
        </p>
      </div>
    );
  }
  
  // Calculate best execution DEXs
  const bestDEXs = Object.entries(metrics.protocolUsage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, percentage]) => ({ name, percentage }));
    
  // Format token amounts
  const formatAmount = (amount: string, decimals: number = 6): string => {
    return (parseInt(amount) / Math.pow(10, decimals)).toFixed(4);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Timeframe selector */}
      <div className="mb-6">
        <div className="text-sm text-slate-400 mb-2">Timeframe</div>
        <div className="flex space-x-2">
          {(['1h', '24h', '7d', '30d'] as const).map((t) => (
            <button
              key={t}
              className={`px-3 py-1 text-sm rounded ${
                timeframe === t ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
              onClick={() => setTimeframe(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Route statistics */}
        <div className="glass-card p-4">
          <h4 className="text-sm text-slate-400 mb-3">Route Statistics</h4>
          <div className="grid grid-cols-2 gap-y-3">
            <div className="text-sm text-slate-300">Available Routes</div>
            <div className="text-sm font-medium">{metrics.routeCount}</div>
            
            <div className="text-sm text-slate-300">Best Rate</div>
            <div className="text-sm font-medium text-green-400">
              {formatAmount(metrics.bestOutAmount)} {outputToken?.symbol}
            </div>
            
            <div className="text-sm text-slate-300">Worst Rate</div>
            <div className="text-sm font-medium text-red-400">
              {formatAmount(metrics.worstOutAmount)} {outputToken?.symbol}
            </div>
            
            <div className="text-sm text-slate-300">Average Rate</div>
            <div className="text-sm font-medium">
              {formatAmount(metrics.averageOutAmount)} {outputToken?.symbol}
            </div>
          </div>
        </div>

        {/* Price Impact */}
        <div className="glass-card p-4">
          <h4 className="text-sm text-slate-400 mb-3">Price Impact</h4>
          <div className="grid grid-cols-2 gap-y-3">
            <div className="text-sm text-slate-300">Min Impact</div>
            <div className="text-sm font-medium text-green-400">
              {metrics.priceImpactRange.min.toFixed(3)}%
            </div>
            
            <div className="text-sm text-slate-300">Max Impact</div>
            <div className="text-sm font-medium text-red-400">
              {metrics.priceImpactRange.max.toFixed(3)}%
            </div>
            
            <div className="text-sm text-slate-300">Average Impact</div>
            <div className="text-sm font-medium">
              {metrics.priceImpactRange.avg.toFixed(3)}%
            </div>
          </div>
        </div>

        {/* Protocol usage */}
        <div className="glass-card p-4">
          <h4 className="text-sm text-slate-400 mb-3">Protocol Usage</h4>
          {bestDEXs.map((dex, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>{dex.name}</span>
                <span>{dex.percentage}%</span>
              </div>
              <div className="bg-slate-700 h-1.5 rounded-full">
                <div 
                  className="bg-indigo-500 h-full rounded-full"
                  style={{ width: `${dex.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Hop distribution */}
        <div className="glass-card p-4">
          <h4 className="text-sm text-slate-400 mb-3">Route Complexity</h4>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(metrics.hopCounts).map(([hops, percent]) => (
              <div key={hops} className="flex flex-col items-center">
                <div className="flex justify-center items-end h-20">
                  <div 
                    className="w-10 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t"
                    style={{ height: `${Math.max(10, percent)}%` }}
                  />
                </div>
                <div className="text-xs mt-1">{hops} hop{parseInt(hops) !== 1 ? 's' : ''}</div>
                <div className="text-xs text-slate-400">{percent}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Smart Insights */}
      <div className="glass-card p-4 mt-4">
        <h4 className="text-sm text-slate-400 mb-3">Smart Insights</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <div className="text-green-400 mr-2">✓</div>
            <div>
              <span className="font-medium">Best Time to Swap:</span>{' '}
              Based on historical data, swapping between {inputToken?.symbol} and {outputToken?.symbol} typically has lower slippage during 
              {' '}<span className="text-green-400">off-peak hours (12 AM - 4 AM UTC)</span>.
            </div>
          </li>
          <li className="flex items-start">
            <div className="text-yellow-400 mr-2">!</div>
            <div>
              <span className="font-medium">Route Suggestion:</span>{' '}
              For this pair, direct routes through {bestDEXs[0]?.name} typically offer better rates than multi-hop routes.
            </div>
          </li>
          <li className="flex items-start">
            <div className="text-blue-400 mr-2">i</div>
            <div>
              <span className="font-medium">Volume Alert:</span>{' '}
              Trading in amounts larger than 1000 {inputToken?.symbol} may result in significantly higher price impact.
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RouteAnalytics; 