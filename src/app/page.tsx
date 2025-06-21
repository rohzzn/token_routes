"use client";
import React, { useState } from "react";
import TokenSelector from "../components/TokenSelector";
import RouteGraph from "../components/RouteGraph";
import SwapPanel from "../components/SwapPanel";
import RouteAnalytics from "../components/RouteAnalytics";
import ThemeToggle from "../components/ThemeToggle";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

type TokenInfo = {
  address: string;
  symbol: string;
  name: string;
  logoURI: string;
  decimals: number;
};

export default function Home() {
  const { publicKey } = useWallet();
  const [inputToken, setInputToken] = useState<TokenInfo | null>(null);
  const [outputToken, setOutputToken] = useState<TokenInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'analytics'>('visualizer');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-slate-700/50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.163 0 0 7.163 0 16C0 24.837 7.163 32 16 32C24.837 32 32 24.837 32 16C32 7.163 24.837 0 16 0Z" fill="#9945FF"/>
              <path d="M24.5 16.75C24.5 15.7835 23.7165 15 22.75 15H9.25C8.2835 15 7.5 15.7835 7.5 16.75C7.5 17.7165 8.2835 18.5 9.25 18.5H22.75C23.7165 18.5 24.5 17.7165 24.5 16.75Z" fill="white"/>
              <path d="M16.75 24.5C17.7165 24.5 18.5 23.7165 18.5 22.75L18.5 9.25C18.5 8.2835 17.7165 7.5 16.75 7.5C15.7835 7.5 15 8.2835 15 9.25L15 22.75C15 23.7165 15.7835 24.5 16.75 24.5Z" fill="white"/>
            </svg>
            <h1 className="font-bold text-xl gradient-text">Jupiter Router Explorer</h1>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://dev.jup.ag/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Docs
            </a>
            <ThemeToggle />
            <WalletMultiButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2 gradient-text">
            Advanced Swap Route Explorer
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Visualize and optimize your token swaps on Solana&apos;s leading liquidity aggregator.
            Find the best routes, analyze price impact, and execute swaps with confidence.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-slate-800/50 rounded-lg p-1">
            <button
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === 'visualizer' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-300 hover:text-white'
              }`}
              onClick={() => setActiveTab('visualizer')}
            >
              Route Visualizer
            </button>
            <button
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === 'analytics' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-300 hover:text-white'
              }`}
              onClick={() => setActiveTab('analytics')}
            >
              Route Analytics
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="glass-card p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3">
              <div className="glass-card p-4 mb-6">
                <h3 className="text-lg font-semibold mb-4">Select Tokens</h3>
                <div className="flex flex-col gap-4">
                  <TokenSelector label="From" onSelect={setInputToken} />
                  <div className="flex justify-center">
                    <button 
                      className="bg-slate-700 p-2 rounded-full"
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
              <SwapPanel inputToken={inputToken} outputToken={outputToken} />
            </div>
            
            <div className="lg:w-2/3">
              {activeTab === 'visualizer' && (
                <div className="glass-card p-4 h-full">
                  <h3 className="text-lg font-semibold mb-4">Route Visualization</h3>
                  <RouteGraph inputToken={inputToken} outputToken={outputToken} />
                </div>
              )}
              
              {activeTab === 'analytics' && (
                <div className="glass-card p-4 h-full">
                  <h3 className="text-lg font-semibold mb-4">Route Analytics</h3>
                  <RouteAnalytics inputToken={inputToken} outputToken={outputToken} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-slate-700/50">
        <div className="container mx-auto text-center text-sm text-slate-400">
          <p>
            Powered by Jupiter Exchange &bull; Solana&apos;s #1 Liquidity Aggregator
          </p>
          <p className="mt-1">
            {publicKey 
              ? `Connected: ${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` 
              : 'Not connected'}
          </p>
        </div>
      </footer>
    </div>
  );
}