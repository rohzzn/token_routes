"use client";
// LimitOrderPanel: Handles limit order creation and management
import React, { useState, useEffect } from "react";
import type { TokenInfo } from "./TokenSelector";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

type LimitOrderPanelProps = {
  inputToken: TokenInfo | null;
  outputToken: TokenInfo | null;
};

interface LimitOrder {
  id: string;
  inputToken: string;
  outputToken: string;
  inputAmount: string;
  outputAmount: string;
  price: string;
  expiry: string;
  status: "active" | "filled" | "canceled";
  createdAt: string;
}

const LimitOrderPanel: React.FC<LimitOrderPanelProps> = ({ inputToken, outputToken }) => {
  const { publicKey, connected } = useWallet();
  const [inputAmount, setInputAmount] = useState("1");
  const [outputAmount, setOutputAmount] = useState("");
  const [price, setPrice] = useState("");
  const [expiry, setExpiry] = useState("24h");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeOrders, setActiveOrders] = useState<LimitOrder[]>([]);
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [priceImpact, setPriceImpact] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  
  // Fetch market price when tokens change
  useEffect(() => {
    const fetchMarketPrice = async () => {
      if (!inputToken || !outputToken) return;
      
      try {
        const response = await fetch(`https://price.jup.ag/v4/price?ids=${inputToken.address},${outputToken.address}`);
        const data = await response.json();
        
        if (data.data && data.data[inputToken.address] && data.data[outputToken.address]) {
          const inputPrice = data.data[inputToken.address].price;
          const outputPrice = data.data[outputToken.address].price;
          const ratio = outputPrice / inputPrice;
          
          setMarketPrice(ratio);
          
          // Update output amount based on input and market price
          const calculatedOutput = parseFloat(inputAmount) * ratio;
          setOutputAmount(calculatedOutput.toFixed(6));
          
          // Default limit price to slightly better than market (5% better for buy)
          const suggestedPrice = (ratio * 0.95).toFixed(6);
          setPrice(suggestedPrice);
        }
      } catch (err) {
        console.error("Failed to fetch market price:", err);
      }
    };
    
    fetchMarketPrice();
  }, [inputToken, outputToken, inputAmount]);
  
  // Calculate price impact when limit price changes
  useEffect(() => {
    if (marketPrice && price) {
      const priceVal = parseFloat(price);
      const impact = ((priceVal - marketPrice) / marketPrice) * 100;
      setPriceImpact(impact);
    }
  }, [marketPrice, price]);
  
  // Update output amount when input or price changes
  useEffect(() => {
    if (inputAmount && price) {
      const calculatedOutput = parseFloat(inputAmount) * parseFloat(price);
      if (!isNaN(calculatedOutput)) {
        setOutputAmount(calculatedOutput.toFixed(6));
      }
    }
  }, [inputAmount, price]);

  // Handle limit order creation
  const createLimitOrder = async () => {
    if (!connected) {
      setError("Please connect wallet");
      return;
    }
    
    if (!inputToken || !outputToken) {
      setError("Please select tokens");
      return;
    }
    
    if (isNaN(parseFloat(inputAmount)) || parseFloat(inputAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setError("Please enter a valid price");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // This is a placeholder for actual limit order creation
      // In a real implementation, this would call Jupiter's limit order API
      console.log("Creating limit order:", {
        inputToken: inputToken.address,
        outputToken: outputToken.address,
        inputAmount,
        outputAmount,
        price,
        expiry,
        wallet: publicKey?.toString()
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add to active orders (simulated)
      const newOrder: LimitOrder = {
        id: `order-${Date.now()}`,
        inputToken: inputToken.symbol,
        outputToken: outputToken.symbol,
        inputAmount,
        outputAmount,
        price,
        expiry,
        status: "active",
        createdAt: new Date().toISOString()
      };
      
      setActiveOrders(prev => [newOrder, ...prev]);
      
      // Reset form
      setInputAmount("1");
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create limit order";
      setError(errorMessage);
      console.error("Error creating limit order:", err);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = (orderId: string) => {
    // Simulate cancellation
    setActiveOrders(prev => prev.filter(order => order.id !== orderId));
  };

  const getPriceImpactClass = () => {
    if (!priceImpact) return "text-gray-500";
    if (priceImpact > 0) return "text-green-500"; // Better than market
    if (priceImpact > -1) return "text-yellow-500";
    if (priceImpact > -3) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="jupiter-card p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Limit Order</h3>
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="flex flex-col gap-4">
        {/* Market price indicator */}
        {marketPrice && inputToken && outputToken && (
          <div className="bg-gray-50 rounded-lg p-3 mb-2">
            <div className="text-sm text-gray-500 mb-1">Current Market Price</div>
            <div className="flex justify-between items-center">
              <div className="text-lg font-medium">
                1 {inputToken.symbol} = {marketPrice.toFixed(6)} {outputToken.symbol}
              </div>
              <div className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                Market
              </div>
            </div>
          </div>
        )}
        
        {/* Input amount */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-gray-500 text-sm">
            <label>You pay:</label>
            {inputToken && <span>{inputToken.symbol}</span>}
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="bg-transparent border-none w-full focus:outline-none text-lg jupiter-input"
              placeholder="0"
              min="0"
            />
            <span className="text-gray-700 font-medium">{inputToken?.symbol || "---"}</span>
          </div>
        </div>
        
        {/* Price setting */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-gray-500 text-sm">
            <label>Price:</label>
            {priceImpact !== null && (
              <span className={getPriceImpactClass()}>
                {priceImpact > 0 ? "+" : ""}{priceImpact.toFixed(2)}% vs market
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-transparent border-none w-full focus:outline-none text-lg jupiter-input"
              placeholder="0"
              min="0"
              step="0.000001"
            />
            <span className="text-gray-700 font-medium">{outputToken?.symbol || "---"}</span>
          </div>
        </div>
        
        {/* Output amount preview */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-gray-500 text-sm">
            <label>You receive:</label>
            {outputToken && <span>{outputToken.symbol}</span>}
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
            <input
              type="number"
              value={outputAmount}
              onChange={(e) => {
                setOutputAmount(e.target.value);
                // Recalculate price based on input and new output
                if (inputAmount && e.target.value) {
                  const newPrice = parseFloat(e.target.value) / parseFloat(inputAmount);
                  if (!isNaN(newPrice)) {
                    setPrice(newPrice.toFixed(6));
                  }
                }
              }}
              className="bg-transparent border-none w-full focus:outline-none text-lg jupiter-input"
              placeholder="0"
              min="0"
            />
            <span className="text-gray-700 font-medium">{outputToken?.symbol || "---"}</span>
          </div>
        </div>
        
        {/* Expiry setting */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-sm">Expires in:</label>
          <div className="grid grid-cols-4 gap-2">
            {['1h', '24h', '7d', '30d'].map((value) => (
              <button
                key={value}
                className={`p-2 rounded-lg text-center ${
                  expiry === value 
                    ? "bg-green-100 text-green-700 font-medium" 
                    : "bg-gray-100 text-gray-600"
                }`}
                onClick={() => setExpiry(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        
        {showAdvanced && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Order Expiry
              </label>
              <div className="flex gap-2">
                {['1h', '24h', '7d', '30d'].map((value) => (
                  <button
                    key={value}
                    className={`px-3 py-1 text-sm rounded-md ${
                      expiry === value 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                    onClick={() => setExpiry(value)}
                  >
                    {value}
                  </button>
                ))}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="jupiter-input w-full text-sm"
                    placeholder="Custom"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center mb-2">
              <input
                id="post-only"
                type="checkbox"
                className="h-4 w-4 text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-400 border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="post-only" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Post-only (Maker-only order)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="allow-partial"
                type="checkbox"
                className="h-4 w-4 text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-400 border-gray-300 dark:border-gray-600 rounded"
                defaultChecked
              />
              <label htmlFor="allow-partial" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Allow partial fills
              </label>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}
        
        {/* Create order button */}
        {!connected ? (
          <WalletMultiButton className="w-full jupiter-btn-primary py-2 px-4 rounded-lg" />
        ) : (
          <button
            onClick={createLimitOrder}
            disabled={loading || !inputToken || !outputToken}
            className={`w-full py-3 rounded-lg font-medium ${
              loading || !inputToken || !outputToken
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "jupiter-btn-primary"
            }`}
          >
            {loading ? "Creating Order..." : "Create Limit Order"}
          </button>
        )}
        
        {/* Active orders */}
        {activeOrders.length > 0 && (
          <div className="mt-4">
            <h4 className="text-md font-medium mb-2">Active Orders</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activeOrders.map((order) => (
                <div key={order.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{order.inputAmount} {order.inputToken} → {order.outputAmount} {order.outputToken}</span>
                    <button 
                      onClick={() => cancelOrder(order.id)}
                      className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-full hover:bg-red-100"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 flex justify-between">
                    <span>Price: {order.price} {order.outputToken}/{order.inputToken}</span>
                    <span>Expires in: {order.expiry}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LimitOrderPanel; 