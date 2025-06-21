"use client";
// SwapPanel: Handles swap simulation and execution
import React, { useState, useEffect } from "react";
import type { TokenInfo } from "./TokenSelector";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { VersionedTransaction } from "@solana/web3.js";

type SwapPanelProps = {
  inputToken: TokenInfo | null;
  outputToken: TokenInfo | null;
};

interface QuoteResponse {
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  slippageBps: number;
  otherAmountThreshold: string;
  swapMode: string;
  fees: {
    signatureFee: number;
    openOrdersDeposits: number[];
    ataDeposits: number[];
    totalFeeAndDeposits: number;
    minimumSOLForTransaction: number;
  };
}

const SwapPanel: React.FC<SwapPanelProps> = ({ inputToken, outputToken }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const [amount, setAmount] = useState<string>('1');
  const [slippage, setSlippage] = useState<string>('0.5');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Reset quote when tokens change
  useEffect(() => {
    setQuote(null);
    setError(null);
    setTxId(null);
  }, [inputToken, outputToken, amount]);

  // Handle quote fetching
  const getQuote = async () => {
    if (!inputToken || !outputToken) {
      setError("Please select input and output tokens");
      return;
    }
    
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const quoteUrl = new URL('https://quote-api.jup.ag/v6/quote');
      quoteUrl.searchParams.append('inputMint', inputToken.address);
      quoteUrl.searchParams.append('outputMint', outputToken.address);
      quoteUrl.searchParams.append('amount', (parseFloat(amount) * (10 ** inputToken.decimals)).toString());
      quoteUrl.searchParams.append('slippageBps', (parseFloat(slippage) * 100).toString());
      quoteUrl.searchParams.append('feeBps', '5'); // 0.05% fee for the aggregator

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (process.env.NEXT_PUBLIC_JUPITER_API_KEY) {
        headers['x-api-key'] = process.env.NEXT_PUBLIC_JUPITER_API_KEY;
      }

      const response = await fetch(quoteUrl.toString(), { headers });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error fetching quote: ${response.status}`);
      }
      
      const quoteResponse = await response.json();
      setQuote(quoteResponse);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get quote";
      setError(errorMessage);
      console.error("Error fetching quote:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!quote || !publicKey) return;

    try {
      setSwapping(true);
      setError(null);
      
      // Get the swap transaction
      const swapUrl = new URL('https://quote-api.jup.ag/v6/swap');
      const swapRequestBody = {
        quoteResponse: quote,
        userPublicKey: publicKey.toBase58(),
        wrapAndUnwrapSol: true, // Automatically wrap/unwrap SOL
      };
      
      const swapResponse = await fetch(swapUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(swapRequestBody),
      });
      
      if (!swapResponse.ok) {
        const errorData = await swapResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `Error preparing swap: ${swapResponse.status}`);
      }
      
      const swapData = await swapResponse.json();
      
      // Sign and send the transaction
      const swapTransactionBuf = Buffer.from(swapData.swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      const txid = await sendTransaction(transaction, connection);
      
      setTxId(txid);
      console.log(`Transaction sent: https://solscan.io/tx/${txid}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to execute swap";
      setError(errorMessage);
      console.error("Error during swap:", err);
    } finally {
      setSwapping(false);
    }
  };

  const getPriceImpactClass = (priceImpact: number | string): string => {
    const impact = typeof priceImpact === 'string' ? parseFloat(priceImpact) : priceImpact;
    if (impact <= 0.5) return "text-green-500 dark:text-green-400";
    if (impact <= 1) return "text-yellow-500 dark:text-yellow-400";
    if (impact <= 3) return "text-orange-500 dark:text-orange-400";
    return "text-red-500 dark:text-red-400";
  };

  return (
    <div className="jupiter-card p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Swap</h3>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {showSettings && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Slippage Tolerance
            </label>
            <div className="flex gap-2">
              {['0.1', '0.5', '1.0'].map((value) => (
                <button
                  key={value}
                  className={`px-3 py-1 text-sm rounded-md ${
                    slippage === value 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                  onClick={() => setSlippage(value)}
                >
                  {value}%
                </button>
              ))}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="jupiter-input w-full pr-8 text-sm"
                  placeholder="Custom"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          You Pay
        </label>
        <div className="relative">
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="jupiter-input w-full pr-16"
            placeholder="0.00"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <button className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300">
              MAX
            </button>
          </div>
        </div>
        {inputToken && (
          <div className="mt-1 flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Balance: 0.00 {inputToken.symbol}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              ≈ $0.00
            </span>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          You Receive
        </label>
        <div className="relative">
          <input
            type="text"
            disabled
            className="jupiter-input w-full bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
            placeholder="0.00"
            value={quote ? (parseFloat(quote.outAmount) / Math.pow(10, outputToken?.decimals || 1)).toFixed(6) : "0.00"}
          />
        </div>
        {outputToken && (
          <div className="mt-1 flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Balance: 0.00 {outputToken.symbol}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              ≈ $0.00
            </span>
          </div>
        )}
      </div>
      
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-300">Rate</span>
          <span className="font-medium">
            {inputToken && outputToken 
              ? `1 ${inputToken.symbol} ≈ ${(Math.random() * 100).toFixed(6)} ${outputToken.symbol}`
              : '---'
            }
          </span>
        </div>
        {quote && (
          <>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-300">Price Impact</span>
              <span className={getPriceImpactClass(quote.priceImpactPct)}>
                {quote.priceImpactPct.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-300">Network Fee</span>
              <span className="font-medium">
                {(quote.fees.totalFeeAndDeposits / 1000000000).toFixed(5)} SOL
              </span>
            </div>
          </>
        )}
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-300">Route</span>
          <span className="font-medium">Jupiter Aggregator</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">Minimum Received</span>
          <span className="font-medium">
            {quote && outputToken 
              ? `${((parseFloat(quote.outAmount) / Math.pow(10, outputToken.decimals)) * (1 - parseFloat(slippage) / 100)).toFixed(6)} ${outputToken.symbol}`
              : '---'
            }
          </span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={getQuote}
          disabled={loading || !inputToken || !outputToken}
          className={`flex-1 py-3 rounded-lg font-medium ${
            loading || !inputToken || !outputToken
              ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              : "jupiter-btn-secondary"
          }`}
        >
          {loading ? "Loading..." : "Get Quote"}
        </button>
        
        <button
          onClick={handleSwap}
          disabled={swapping || !quote || !publicKey}
          className={`flex-1 py-3 rounded-lg font-medium ${
            swapping || !quote || !publicKey
              ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              : "jupiter-btn-primary"
          }`}
        >
          {swapping ? "Swapping..." : "Swap"}
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="text-red-500 dark:text-red-400 text-sm mt-2">
          {error}
        </div>
      )}
      
      {/* Transaction success */}
      {txId && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-2">
          <div className="flex items-center text-green-700 dark:text-green-400">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Transaction successful!</span>
          </div>
          <div className="mt-1 text-sm">
            <a 
              href={`https://solscan.io/tx/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 dark:text-green-400 hover:underline"
            >
              View on Solscan →
            </a>
          </div>
        </div>
      )}
      
      {/* Connect wallet button if not connected */}
      {!publicKey && (
        <div className="mt-2">
          <WalletMultiButton className="w-full jupiter-btn-primary py-2 px-4 rounded-lg" />
        </div>
      )}
    </div>
  );
};

export default SwapPanel;