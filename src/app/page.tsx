"use client";
import React, { useState } from "react";
import TokenSelector from "../components/TokenSelector";
import RouteGraph from "../components/RouteGraph";
import SwapPanel from "../components/SwapPanel";
import RouteAnalytics from "../components/RouteAnalytics";
import ThemeToggle from "../components/ThemeToggle";
import MCPInfo from "../components/MCPInfo";
import dynamic from "next/dynamic";
import Image from "next/image";

// Import wallet button dynamically with no SSR to avoid hydration errors
const WalletMultiButtonDynamic = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

// Import our new components dynamically to avoid hydration errors
const LimitOrderPanel = dynamic(() => import("../components/LimitOrderPanel"), { ssr: false });
const DCAPanel = dynamic(() => import("../components/DCAPanel"), { ssr: false });

type TokenInfo = {
  address: string;
  symbol: string;
  name: string;
  logoURI: string;
  decimals: number;
};

export default function Home() {
  const [inputToken, setInputToken] = useState<TokenInfo | null>(null);
  const [outputToken, setOutputToken] = useState<TokenInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'swap' | 'limit' | 'dca' | 'visualizer' | 'analytics' | 'mcp'>('swap');

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image 
              src="/branding/jupiter-logo.svg" 
              alt="Jupiter Logo" 
              width={32} 
              height={32} 
              className="w-8 h-8"
            />
            <h1 className="font-bold text-xl gradient-text">Jupiter Router</h1>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://dev.jup.ag/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Docs
            </a>
            <div className="flex-shrink-0">
              <ThemeToggle />
            </div>
            <WalletMultiButtonDynamic className="jupiter-btn-primary" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2 gradient-text">
            Advanced Swap Route Explorer
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Visualize and optimize your token swaps on Solana&apos;s leading liquidity aggregator.
            Find the best routes, analyze price impact, and execute swaps with confidence.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
            <button
              className={`jupiter-tab ${
                activeTab === 'swap' 
                  ? 'jupiter-tab-active' 
                  : 'jupiter-tab-inactive'
              }`}
              onClick={() => setActiveTab('swap')}
            >
              Swap
            </button>
            <button
              className={`jupiter-tab ${
                activeTab === 'limit' 
                  ? 'jupiter-tab-active' 
                  : 'jupiter-tab-inactive'
              }`}
              onClick={() => setActiveTab('limit')}
            >
              Limit Orders
            </button>
            <button
              className={`jupiter-tab ${
                activeTab === 'dca' 
                  ? 'jupiter-tab-active' 
                  : 'jupiter-tab-inactive'
              }`}
              onClick={() => setActiveTab('dca')}
            >
              DCA
            </button>
            <button
              className={`jupiter-tab ${
                activeTab === 'visualizer' 
                  ? 'jupiter-tab-active' 
                  : 'jupiter-tab-inactive'
              }`}
              onClick={() => setActiveTab('visualizer')}
            >
              Route Visualizer
            </button>
            <button
              className={`jupiter-tab ${
                activeTab === 'analytics' 
                  ? 'jupiter-tab-active' 
                  : 'jupiter-tab-inactive'
              }`}
              onClick={() => setActiveTab('analytics')}
            >
              Route Analytics
            </button>
            <button
              className={`jupiter-tab ${
                activeTab === 'mcp' 
                  ? 'jupiter-tab-active' 
                  : 'jupiter-tab-inactive'
              }`}
              onClick={() => setActiveTab('mcp')}
            >
              MCP Implementation
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="jupiter-card p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3">
              <div className="jupiter-card p-4 mb-6">
                <h3 className="text-lg font-semibold mb-4">Select Tokens</h3>
                <div className="flex flex-col gap-4">
                  <TokenSelector label="From" onSelect={setInputToken} />
                  <div className="flex justify-center">
                    <button 
                      className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full"
                      onClick={() => {
                        const temp = inputToken;
                        setInputToken(outputToken);
                        setOutputToken(temp);
                      }}
                    >
                      ↑↓
                    </button>
                  </div>
                  <TokenSelector label="To" onSelect={setOutputToken} />
                </div>
              </div>
              {activeTab === 'swap' && <SwapPanel inputToken={inputToken} outputToken={outputToken} />}
              {activeTab === 'limit' && <LimitOrderPanel inputToken={inputToken} outputToken={outputToken} />}
              {activeTab === 'dca' && <DCAPanel inputToken={inputToken} outputToken={outputToken} />}
            </div>
            
            <div className="lg:w-2/3">
              {activeTab === 'swap' && (
                <div className="jupiter-card p-4 h-full">
                  <h3 className="text-lg font-semibold mb-4">Swap</h3>
                  <RouteGraph inputToken={inputToken} outputToken={outputToken} />
                </div>
              )}
              
              {activeTab === 'limit' && (
                <div className="jupiter-card p-4 h-full">
                  <h3 className="text-lg font-semibold mb-4">Limit Orders</h3>
                  <div className="flex flex-col h-full">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                      <h4 className="font-medium mb-2">What are Limit Orders?</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Limit orders allow you to set a specific price at which you want to buy or sell tokens.
                        Your order will execute automatically when the market reaches your target price.
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Benefits</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>Execute trades at your desired price</li>
                        <li>No need to constantly monitor the market</li>
                        <li>Capture price movements while you&apos;re away</li>
                        <li>Better control over your trading strategy</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'dca' && (
                <div className="jupiter-card p-4 h-full">
                  <h3 className="text-lg font-semibold mb-4">Dollar Cost Averaging</h3>
                  <div className="flex flex-col h-full">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                      <h4 className="font-medium mb-2">What is DCA?</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Dollar Cost Averaging (DCA) is an investment strategy where you divide up the total amount to be invested 
                        into periodic purchases to reduce the impact of volatility on the overall purchase.
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                      <h4 className="font-medium mb-2">Benefits</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>Reduces the impact of market volatility</li>
                        <li>Removes emotional decision-making</li>
                        <li>Builds positions gradually over time</li>
                        <li>Potentially lower average cost basis</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">How it works</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Set up an automatic schedule to buy a fixed dollar amount of tokens at regular intervals, 
                        regardless of the token&apos;s price. Over time, this can result in a lower average cost per token 
                        compared to a single lump-sum purchase.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'visualizer' && (
                <div className="jupiter-card p-4 h-full">
                  <h3 className="text-lg font-semibold mb-4">Route Visualization</h3>
                  <RouteGraph inputToken={inputToken} outputToken={outputToken} />
                </div>
              )}
              
              {activeTab === 'analytics' && (
                <div className="jupiter-card p-4 h-full">
                  <h3 className="text-lg font-semibold mb-4">Route Analytics</h3>
                  <RouteAnalytics inputToken={inputToken} outputToken={outputToken} />
                </div>
              )}

              {activeTab === 'mcp' && (
                <div className="jupiter-card p-4 h-full">
                  <h3 className="text-lg font-semibold mb-4">Jupiter API Machine Context Prompt (MCP)</h3>
                  <MCPInfo />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Powered by Jupiter Exchange &bull; Solana&apos;s #1 Liquidity Aggregator
          </p>
        </div>
      </footer>
    </div>
  );
}