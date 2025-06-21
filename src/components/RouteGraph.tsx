"use client";
// RouteGraph: Visualizes swap routes using react-flow
import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import type { TokenInfo } from "./TokenSelector";

// Create a simplified version that doesn't use ReactFlow for now
type RouteGraphProps = {
  inputToken: TokenInfo | null;
  outputToken: TokenInfo | null;
};

type SwapInfo = {
  ammKey: string;
  label: string;
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  feeAmount: string;
  feeMint: string;
};

type RoutePlan = {
  swapInfo: SwapInfo;
  percent: number;
};

type Route = {
  amount: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: number | string;
  marketInfos: unknown[];
  routePlan: RoutePlan[];
  slippageBps: number;
  otherAmountThreshold: string;
  swapMode: string;
}

type MarketInfo = {
  id?: string;
  ammKey?: string;
  label?: string;
  inputMint?: string;
  outputMint?: string;
  inAmount?: string;
  outAmount?: string;
  feeAmount?: string;
  feeMint?: string;
};

type JupiterRoute = {
  amount?: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: number | string;
  marketInfos?: MarketInfo[];
  routePlan?: RoutePlan[];
  slippageBps?: number;
  otherAmountThreshold?: string;
  swapMode?: string;
};

const routeColors = [
  '#6366f1', // primary indigo
  '#f97316', // orange
  '#10b981', // emerald
  '#f43f5e', // rose
  '#8b5cf6', // violet
];

const getProtocolFromLabel = (label: string): string => {
  if (!label) return "Unknown";
  
  // Convert to lowercase for case-insensitive matching
  const labelLower = label.toLowerCase();
  
  const protocolMap: Record<string, string> = {
    'orca': 'Orca',
    'raydium': 'Raydium',
    'meteora': 'Meteora',
    'cykura': 'Cykura',
    'invariant': 'Invariant',
    'lifinity': 'Lifinity',
    'saber': 'Saber',
    'step': 'Step',
    'atrix': 'Atrix',
    'mercurial': 'Mercurial',
    'aldrin': 'Aldrin',
    'serum': 'Serum',
    'openbook': 'OpenBook',
    'dex': 'Serum',
    'crema': 'Crema',
    'saros': 'Saros',
    'penguin': 'Penguin',
    'jupiter': 'Jupiter',
    'whirlpool': 'Orca Whirlpool',
    'phoenix': 'Phoenix',
    'balancer': 'Balancer',
    'marinade': 'Marinade',
    'lido': 'Lido',
    'jito': 'Jito',
    'drift': 'Drift',
    'mango': 'Mango',
    'zeta': 'Zeta',
    'dlmm': 'DLMM',
    'symmetric': 'Symmetric',
    'bonk': 'Bonk',
    'v2': 'V2',
    'v3': 'V3',
    'v4': 'V4',
  };

  // Check for common protocol names in the label
  for (const [key, value] of Object.entries(protocolMap)) {
    if (labelLower.includes(key)) {
      // For V2/V3/V4 suffixes, try to combine with the protocol name
      if (labelLower.includes('v2') && !key.includes('v2') && value !== 'V2') {
        return `${value} V2`;
      }
      if (labelLower.includes('v3') && !key.includes('v3') && value !== 'V3') {
        return `${value} V3`;
      }
      if (labelLower.includes('v4') && !key.includes('v4') && value !== 'V4') {
        return `${value} V4`;
      }
      return value;
    }
  }
  
  // If we can't identify the protocol but have a label, return it as is
  if (label.trim()) {
    return label.trim();
  }
  
  return "Unknown";
};

const formatTokenAmount = (amount: string, decimals: number): string => {
  const value = parseInt(amount) / Math.pow(10, decimals);
  if (value < 0.001) return value.toExponential(2);
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 6,
  });
};

const RouteGraph: React.FC<RouteGraphProps> = ({ inputToken, outputToken }) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [showAllRoutes, setShowAllRoutes] = useState<boolean>(false);
  const [imageFallback, setImageFallback] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!inputToken || !outputToken) {
      setRoutes([]);
      return;
    }
    
    setLoading(true);
    const fetchUrl = new URL('https://quote-api.jup.ag/v6/quote');
    fetchUrl.searchParams.append('inputMint', inputToken.address);
    fetchUrl.searchParams.append('outputMint', outputToken.address);
    fetchUrl.searchParams.append('amount', '10000000'); // 10 tokens with 6 decimals
    fetchUrl.searchParams.append('slippageBps', '50'); // 0.5%
    fetchUrl.searchParams.append('onlyDirectRoutes', 'false');
    fetchUrl.searchParams.append('maxRoutes', '3');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (process.env.NEXT_PUBLIC_JUPITER_API_KEY) {
      headers['x-api-key'] = process.env.NEXT_PUBLIC_JUPITER_API_KEY;
    }

    fetch(fetchUrl.toString(), { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.routes && data.routes.length > 0) {
          // Process routes to ensure they have routePlan data
          const processedRoutes = data.routes.map((route: JupiterRoute) => {
            // If routePlan is empty or null but we have marketInfos, create a routePlan from marketInfos
            if ((!route.routePlan || route.routePlan.length === 0) && route.marketInfos && route.marketInfos.length > 0) {
              route.routePlan = route.marketInfos.map((info: MarketInfo) => ({
                swapInfo: {
                  ammKey: info.id || info.ammKey || "unknown",
                  label: info.label || "Unknown AMM",
                  inputMint: info.inputMint || inputToken.address,
                  outputMint: info.outputMint || outputToken.address,
                  inAmount: info.inAmount || route.inAmount,
                  outAmount: info.outAmount || route.outAmount,
                  feeAmount: info.feeAmount || "0",
                  feeMint: info.feeMint || inputToken.address
                },
                percent: 100 / (route.marketInfos?.length || 1)
              }));
            }
            return route;
          });
          
          setRoutes(processedRoutes as Route[]);
          setSelectedRouteIndex(0);
        } else if (data.routePlan || data.marketInfos) {
          // Handle single route response
          const routePlan = data.routePlan || [];
          // If routePlan is empty but we have marketInfos, create a routePlan from marketInfos
          const processedRoutePlan = routePlan.length === 0 && data.marketInfos && data.marketInfos.length > 0 
            ? data.marketInfos.map((info: MarketInfo) => ({
                swapInfo: {
                  ammKey: info.id || info.ammKey || "unknown",
                  label: info.label || "Unknown AMM",
                  inputMint: info.inputMint || inputToken.address,
                  outputMint: info.outputMint || outputToken.address,
                  inAmount: info.inAmount || data.inAmount,
                  outAmount: info.outAmount || data.outAmount,
                  feeAmount: info.feeAmount || "0",
                  feeMint: info.feeMint || inputToken.address
                },
                percent: 100 / data.marketInfos.length
              }))
            : routePlan;
            
          setRoutes([{
            amount: data.amount,
            inAmount: data.inAmount,
            outAmount: data.outAmount,
            priceImpactPct: data.priceImpactPct,
            marketInfos: data.marketInfos || [],
            routePlan: processedRoutePlan,
            slippageBps: data.slippageBps || 50,
            otherAmountThreshold: data.otherAmountThreshold || '0',
            swapMode: data.swapMode || 'ExactIn'
          }]);
        } else {
          setRoutes([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching routes:", error);
        setRoutes([]);
      })
      .finally(() => setLoading(false));
  }, [inputToken, outputToken]);

  // Get the routes to render
  const routesToRender = useMemo(() => {
    if (routes.length === 0) return [];
    return showAllRoutes ? routes : [routes[selectedRouteIndex]];
  }, [routes, selectedRouteIndex, showAllRoutes]);

  const handleImageError = (address: string) => {
    setImageFallback(prev => ({ ...prev, [address]: true }));
  };

  const renderRouteSelector = () => {
    if (routes.length <= 1) return null;
    
    return (
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex gap-2 mb-2">
          <button
            className={`px-3 py-1 rounded text-sm ${showAllRoutes ? 'bg-indigo-600' : 'bg-slate-700'}`}
            onClick={() => setShowAllRoutes(!showAllRoutes)}
          >
            {showAllRoutes ? 'Hide Routes' : 'Compare All Routes'}
          </button>
        </div>
        
        {!showAllRoutes && (
          <div className="flex flex-wrap gap-2">
            {routes.map((route, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded text-sm ${
                  selectedRouteIndex === i ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
                onClick={() => setSelectedRouteIndex(i)}
              >
                Route {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderRoute = (route: Route, index: number) => {
    const color = routeColors[index % routeColors.length];
    
    // Format price impact safely
    const priceImpact = typeof route.priceImpactPct === 'number' 
      ? route.priceImpactPct.toFixed(3)
      : parseFloat(route.priceImpactPct as string || '0').toFixed(3);
    
    const isPriceImpactHigh = parseFloat(priceImpact) > 1;
    
    return (
      <div 
        key={`route-${index}`} 
        className="p-4 rounded-lg mb-3" 
        style={{ 
          background: 'rgba(30, 41, 59, 0.4)',
          borderLeft: `4px solid ${color}`
        }}
      >
        <div className="flex justify-between items-center mb-3">
          <div className="font-medium">Route {index + 1}</div>
          <div className={`text-sm ${
            isPriceImpactHigh ? 'text-red-400' : 'text-green-400'
          }`}>
            Price Impact: {priceImpact}%
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          {/* Input token */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg px-2 py-1">
            {inputToken && (
              <>
                <div className="relative w-5 h-5 rounded-full overflow-hidden">
                  <Image 
                    src={imageFallback[inputToken.address] 
                      ? "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/svg/color/generic.svg" 
                      : inputToken.logoURI
                    }
                    alt={inputToken.symbol}
                    width={20}
                    height={20}
                    className="rounded-full"
                    onError={() => handleImageError(inputToken.address)}
                    unoptimized
                  />
                </div>
                <span>{inputToken.symbol}</span>
              </>
            )}
          </div>
          
          {/* Route plan visualization */}
          {route.routePlan.length === 0 ? (
            <div className="flex-1 mx-2 flex items-center justify-center">
              <div className="border-t-2 w-full" style={{ borderColor: color }}></div>
              <div className="text-xs mx-2">Direct</div>
              <div className="border-t-2 w-full" style={{ borderColor: color }}></div>
            </div>
          ) : (
            <div className="flex-1 mx-2 flex items-center justify-between">
              <div className="border-t-2 flex-1" style={{ borderColor: color }}></div>
              {route.routePlan.map((hop, hopIndex) => (
                <React.Fragment key={`hop-${hopIndex}`}>
                  <div 
                    className="bg-slate-800 rounded-lg py-1 px-2 mx-1 text-xs text-center"
                    style={{ borderColor: color }}
                  >
                    {getProtocolFromLabel(hop.swapInfo.label)}
                    <div className="text-xs text-slate-400">{hop.percent}%</div>
                  </div>
                  <div className="border-t-2 flex-1" style={{ borderColor: color }}></div>
                </React.Fragment>
              ))}
            </div>
          )}
          
          {/* Output token */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg px-2 py-1">
            {outputToken && (
              <>
                <div className="relative w-5 h-5 rounded-full overflow-hidden">
                  <Image 
                    src={imageFallback[outputToken.address] 
                      ? "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/svg/color/generic.svg" 
                      : outputToken.logoURI
                    }
                    alt={outputToken.symbol}
                    width={20}
                    height={20}
                    className="rounded-full"
                    onError={() => handleImageError(outputToken.address)}
                    unoptimized
                  />
                </div>
                <span>{outputToken.symbol}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div className="text-slate-400">Input Amount:</div>
          <div>{inputToken && formatTokenAmount(route.inAmount, inputToken.decimals)} {inputToken?.symbol}</div>
          
          <div className="text-slate-400">Output Amount:</div>
          <div>{outputToken && formatTokenAmount(route.outAmount, outputToken.decimals)} {outputToken?.symbol}</div>
          
          <div className="text-slate-400">Slippage Tolerance:</div>
          <div>{(route.slippageBps / 100).toFixed(2)}%</div>
          
          <div className="text-slate-400">Number of Hops:</div>
          <div>{route.routePlan.length}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-[500px] relative overflow-auto">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-3"></div>
            <span className="text-slate-300">Finding optimal routes...</span>
          </div>
        </div>
      )}

      {!loading && routes.length > 0 && (
        <div className="p-2">
          {renderRouteSelector()}
          {routesToRender.map((route, index) => renderRoute(route, index))}
        </div>
      )}
      
      {!loading && routes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-medium text-slate-400 mb-2">No Routes Found</div>
            <p className="text-slate-500 max-w-md">
              {inputToken && outputToken
                ? `No routes available between ${inputToken.symbol} and ${outputToken.symbol}.`
                : 'Select both tokens to find a route.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteGraph;