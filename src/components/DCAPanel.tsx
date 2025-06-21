"use client";
// DCAPanel: Handles Dollar Cost Averaging setup and management
import React, { useState, useEffect } from "react";
import type { TokenInfo } from "./TokenSelector";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

type DcaPanelProps = {
  inputToken: TokenInfo | null;
  outputToken: TokenInfo | null;
};

interface DcaSchedule {
  id: string;
  inputToken: string;
  outputToken: string;
  amount: string;
  frequency: string;
  nextExecution: string;
  status: "active" | "paused";
}

const DCAPanel: React.FC<DcaPanelProps> = ({ inputToken, outputToken }) => {
  const { publicKey } = useWallet();
  const [amount, setAmount] = useState("10");
  const [frequency, setFrequency] = useState("daily");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSchedules, setActiveSchedules] = useState<DcaSchedule[]>([]);
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [totalInvested, setTotalInvested] = useState(0);
  const [estimatedValue, setEstimatedValue] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [slippage, setSlippage] = useState("1");
  
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
        }
      } catch (err) {
        console.error("Failed to fetch market price:", err);
      }
    };
    
    fetchMarketPrice();
  }, [inputToken, outputToken]);
  
  // Calculate estimated values
  useEffect(() => {
    if (activeSchedules.length > 0 && marketPrice) {
      // Calculate total invested (simulated)
      const total = activeSchedules.reduce((sum, schedule) => {
        return sum + parseFloat(schedule.amount) * 4; // Assume 4 executions happened
      }, 0);
      
      setTotalInvested(total);
      
      // Calculate estimated value (simulated)
      const value = total * 1.15; // Assume 15% gain
      setEstimatedValue(value);
    }
  }, [activeSchedules, marketPrice]);

  // Handle DCA setup
  const setupDCA = async () => {
    if (!inputToken || !outputToken || !publicKey) {
      setError("Please connect wallet and select tokens");
      return;
    }
    
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // This is a placeholder for actual DCA setup
      // In a real implementation, this would call Jupiter's API
      console.log("Setting up DCA:", {
        inputToken: inputToken.address,
        outputToken: outputToken.address,
        amount,
        frequency,
        slippage,
        wallet: publicKey.toString()
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Calculate next execution date based on frequency
      const nextDate = new Date();
      switch (frequency) {
        case "hourly":
          nextDate.setHours(nextDate.getHours() + 1);
          break;
        case "daily":
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case "weekly":
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case "monthly":
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
      }
      
      // Add to active schedules (simulated)
      const newSchedule: DcaSchedule = {
        id: `dca-${Date.now()}`,
        inputToken: inputToken.symbol,
        outputToken: outputToken.symbol,
        amount,
        frequency,
        nextExecution: nextDate.toLocaleString(),
        status: "active"
      };
      
      setActiveSchedules(prev => [newSchedule, ...prev]);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to setup DCA";
      setError(errorMessage);
      console.error("Error setting up DCA:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleScheduleStatus = (scheduleId: string) => {
    setActiveSchedules(prev => prev.map(schedule => {
      if (schedule.id === scheduleId) {
        return {
          ...schedule,
          status: schedule.status === "active" ? "paused" : "active"
        };
      }
      return schedule;
    }));
  };

  const deleteSchedule = (scheduleId: string) => {
    setActiveSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
  };

  const getFrequencyDisplay = (freq: string) => {
    switch (freq) {
      case "hourly": return "Every hour";
      case "daily": return "Every day";
      case "weekly": return "Every week";
      case "monthly": return "Every month";
      default: return freq;
    }
  };

  return (
    <div className="jupiter-card p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Dollar Cost Averaging</h3>
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
        {/* DCA Strategy Info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-2">
          <div className="text-sm text-gray-500 mb-1">DCA Strategy</div>
          <p className="text-sm text-gray-600">
            Dollar Cost Averaging helps reduce the impact of volatility by spreading out your purchases over time.
            Set up regular, automatic purchases to build your position gradually.
          </p>
        </div>
        
        {/* Input amount */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-gray-500 text-sm">
            <label>Amount per purchase:</label>
            {inputToken && <span>{inputToken.symbol}</span>}
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent border-none w-full focus:outline-none text-lg jupiter-input"
              placeholder="0"
              min="0"
            />
            <span className="text-gray-700 font-medium">{inputToken?.symbol || "---"}</span>
          </div>
        </div>
        
        {/* Frequency selection */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-sm">Purchase frequency:</label>
          <div className="grid grid-cols-2 gap-2">
            {["hourly", "daily", "weekly", "monthly"].map((freq) => (
              <button
                key={freq}
                className={`p-2 rounded-lg text-center ${
                  frequency === freq 
                    ? "bg-green-100 text-green-700 font-medium" 
                    : "bg-gray-100 text-gray-600"
                }`}
                onClick={() => setFrequency(freq)}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Advanced options toggle */}
        <div className="mt-2">
          {showAdvanced && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-gray-500 text-sm block mb-1">Slippage tolerance:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={slippage}
                      onChange={(e) => setSlippage(e.target.value)}
                      className="w-full accent-green-500"
                    />
                    <span className="text-gray-700 min-w-[40px] text-right">{slippage}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Market price indicator */}
        {marketPrice && inputToken && outputToken && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">Current rate</div>
              <div className="text-sm font-medium">
                1 {inputToken.symbol} ≈ {marketPrice.toFixed(6)} {outputToken.symbol}
              </div>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}
        
        {/* Setup button */}
        {!publicKey ? (
          <WalletMultiButton className="w-full jupiter-btn-primary py-2 px-4 rounded-lg" />
        ) : (
          <button
            onClick={setupDCA}
            disabled={loading || !inputToken || !outputToken}
            className={`w-full py-3 rounded-lg font-medium ${
              loading || !inputToken || !outputToken
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "jupiter-btn-primary"
            }`}
          >
            {loading ? "Setting up..." : "Setup DCA Strategy"}
          </button>
        )}
        
        {/* Active schedules */}
        {activeSchedules.length > 0 && (
          <div className="mt-4">
            <h4 className="text-md font-medium mb-2">Active DCA Strategies</h4>
            
            {/* Performance metrics */}
            {totalInvested > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Total Invested</div>
                    <div className="text-lg font-medium">{totalInvested.toFixed(2)} {inputToken?.symbol}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Estimated Value</div>
                    <div className={`text-lg font-medium ${estimatedValue > totalInvested ? 'text-green-500' : 'text-red-500'}`}>
                      {estimatedValue.toFixed(2)} {inputToken?.symbol}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activeSchedules.map((schedule) => (
                <div key={schedule.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">
                      {schedule.amount} {schedule.inputToken} → {schedule.outputToken}
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleScheduleStatus(schedule.id)}
                        className={`text-xs px-2 py-1 rounded-full ${
                          schedule.status === "active" 
                            ? "bg-green-100 text-green-600" 
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {schedule.status === "active" ? "Active" : "Paused"}
                      </button>
                      <button 
                        onClick={() => deleteSchedule(schedule.id)}
                        className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-full hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 flex justify-between">
                    <span>{getFrequencyDisplay(schedule.frequency)}</span>
                    <span>Next: {schedule.nextExecution}</span>
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

export default DCAPanel; 