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
  const { publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState("1");
  const [slippage, setSlippage] = useState("0.5");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

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
    if (impact <= 0.5) return "text-green-400";
    if (impact <= 1) return "text-yellow-400";
    if (impact <= 3) return "text-orange-400";
    return "text-red-400";
  };

  const renderOutputAmount = () => {
    if (!quote) return null;
    
    const outputAmount = parseFloat(quote.outAmount) / Math.pow(10, outputToken?.decimals || 1);
    const formattedOutput = outputAmount.toLocaleString(undefined, { 
      maximumFractionDigits: 6
    });
    
    return (
      <div className="flex flex-col gap-1 bg-slate-800/50 p-3 rounded-lg mb-4">
        <div className="flex justify-between text-slate-400 text-sm">
          <span>You receive:</span>
          <span>≈ ${(outputAmount * 1).toFixed(2)}</span>
        </div>
        <div className="text-xl font-medium">
          {formattedOutput} {outputToken?.symbol}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card p-4">
      <h3 className="text-lg font-semibold mb-4">Swap</h3>
      
      <div className="flex flex-col gap-4">
        {/* Input amount */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-slate-400 text-sm">
            <label>You pay:</label>
            {inputToken && <span>≈ ${(parseFloat(amount || "0") * 1).toFixed(2)}</span>}
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent border-none w-full focus:outline-none text-lg"
              placeholder="0"
              min="0"
            />
            <span className="text-slate-300 font-medium">{inputToken?.symbol || "---"}</span>
          </div>
        </div>
        
        {/* Output preview */}
        {renderOutputAmount()}
        
        {/* Transaction details */}
        {quote && (
          <div className="bg-slate-800/30 rounded-lg p-3 mb-3">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-slate-400">Rate</span>
              <span>1 {inputToken?.symbol} = {(parseFloat(quote.outAmount) / parseFloat(quote.inAmount) * Math.pow(10, (inputToken?.decimals || 0) - (outputToken?.decimals || 0))).toFixed(6)} {outputToken?.symbol}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-slate-400">Price Impact</span>
              <span className={getPriceImpactClass(quote.priceImpactPct)}>
                {typeof quote.priceImpactPct === 'number' 
                  ? quote.priceImpactPct.toFixed(2) 
                  : parseFloat(quote.priceImpactPct || '0').toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-slate-400">Max Slippage</span>
              <span>{(quote.slippageBps / 100).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Network Fee</span>
              <span>≈ {(quote.fees?.totalFeeAndDeposits / 10**9).toFixed(5)} SOL</span>
            </div>
            
            {quote.priceImpactPct > 3 && (
              <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded text-sm text-red-300">
                Warning: High price impact! This trade will significantly move the market price.
              </div>
            )}
          </div>
        )}
        
        {/* Slippage settings */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-slate-400">Slippage Tolerance</label>
            <div className="flex gap-1">
              {["0.1", "0.5", "1.0"].map((value) => (
                <button
                  key={value}
                  className={`px-2 py-1 text-xs rounded ${
                    slippage === value ? "bg-indigo-600" : "bg-slate-700"
                  }`}
                  onClick={() => setSlippage(value)}
                >
                  {value}%
                </button>
              ))}
              <div className="relative flex items-center">
                <input 
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="w-12 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs"
                  min="0.1"
                  max="50"
                  step="0.1"
                />
                <span className="absolute right-2 text-xs">%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="text-red-400 text-sm mb-3 p-2 bg-red-900/20 border border-red-900/30 rounded">
            {error}
          </div>
        )}
        
        {/* Success message */}
        {txId && (
          <div className="text-green-400 text-sm mb-3 p-2 bg-green-900/20 border border-green-900/30 rounded">
            Transaction sent! <a 
              href={`https://solscan.io/tx/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View on Explorer
            </a>
          </div>
        )}
        
        {/* Action buttons */}
        {!publicKey ? (
          <WalletMultiButton className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors" />
        ) : (
          <div className="flex flex-col gap-2">
            <button
              className="btn-primary w-full"
              onClick={getQuote}
              disabled={!inputToken || !outputToken || loading || swapping}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-slate-400 border-t-white rounded-full"></span>
                  <span>Getting quote...</span>
                </div>
              ) : quote ? "Refresh Quote" : "Get Quote"}
            </button>
            
            {quote && (
              <button
                className={`btn-primary w-full ${quote.priceImpactPct > 3 ? 'bg-red-600 hover:bg-red-700' : ''}`}
                onClick={handleSwap}
                disabled={!quote || swapping}
              >
                {swapping ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-slate-400 border-t-white rounded-full"></span>
                    <span>Swapping...</span>
                  </div>
                ) : (
                  `Swap ${inputToken?.symbol} to ${outputToken?.symbol}`
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapPanel;