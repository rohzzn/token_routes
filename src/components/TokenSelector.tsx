// TokenSelector: Autocomplete input for SPL tokens using Jupiter Token API
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";

// Default generic token icon as fallback
const DEFAULT_TOKEN_ICON = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMjRDMTguNjI3NCAyNCAyNCAyNCAyNCAxN0MyNCAxMCAyNCA1LjM3MjU4IDE3IDVDMTAgNC42Mjc0MSA0IDEwIDQgMTdDNCAxNyA0IDI0IDEyIDI0WiIgZmlsbD0iI0NDRDJFOSIvPjxwYXRoIGQ9Ik0xMiAyNEMxOC42Mjc0IDI0IDE5IDE4LjYyNzQgMTkgMTJDMTkgNS4zNzI1OCAxOC42Mjc0IDAgMTIgMEM1LjM3MjU4IDAgNSA1LjM3MjU4IDUgMTJDNSAxOC42Mjc0IDUuMzcyNTggMjQgMTIgMjRaIiBmaWxsPSIjODg5RkIwIi8+PC9zdmc+";

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  logoURI: string;
  decimals: number;
}

interface TokenSelectorProps {
  label: string;
  onSelect: (token: TokenInfo) => void;
}

const popularTokens: TokenInfo[] = [
  {
    address: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Wrapped SOL",
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    decimals: 9
  },
  {
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "USD Coin",
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    decimals: 6
  },
  {
    address: "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj",
    symbol: "JitoSOL",
    name: "Jito Staked SOL",
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj/logo.png",
    decimals: 9
  },
  {
    address: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    symbol: "mSOL",
    name: "Marinade Staked SOL",
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png",
    decimals: 9
  },
];

const TokenSelector: React.FC<TokenSelectorProps> = ({ label, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filtered, setFiltered] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageFallback, setImageFallback] = useState<Record<string, boolean>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedLabelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle clicks outside of dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch("https://token.jup.ag/all")
      .then((res) => res.json())
      .then((data) => {
        setTokens(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tokens:", err);
        setLoading(false);
      });
      
    // Load favorites from local storage
    const savedFavorites = localStorage.getItem('tokenFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      // Show favorites or popular tokens when no query
      const favoritesTokens = tokens.filter(t => favorites.includes(t.address));
      setFiltered(favoritesTokens.length > 0 ? favoritesTokens : popularTokens);
    } else {
      setFiltered(
        tokens.filter(
          (t) =>
            t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.address.toLowerCase() === searchQuery.toLowerCase()
        ).slice(0, 10)
      );
    }
  }, [searchQuery, tokens, favorites]);

  const toggleFavorite = (address: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newFavorites = favorites.includes(address)
      ? favorites.filter(f => f !== address)
      : [...favorites, address];
    setFavorites(newFavorites);
    localStorage.setItem('tokenFavorites', JSON.stringify(newFavorites));
  };

  const handleTokenSelect = (token: TokenInfo) => {
    setSelectedToken(token);
    onSelect(token);
    setIsOpen(false);
  };

  const handleImageError = (address: string) => {
    setImageFallback(prev => ({ ...prev, [address]: true }));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="token-selector w-full flex items-center justify-between p-3 text-left"
      >
        {selectedToken ? (
          <div className="flex items-center">
            <div className="w-8 h-8 mr-2 rounded-full overflow-hidden">
              <Image 
                src={imageFallback[selectedToken.address] ? DEFAULT_TOKEN_ICON : selectedToken.logoURI}
                alt={selectedToken.symbol}
                width={32}
                height={32}
                className="object-contain"
                onError={() => handleImageError(selectedToken.address)}
              />
            </div>
            <div>
              <div className="font-medium">{selectedToken.symbol}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{selectedToken.name}</div>
            </div>
          </div>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">Select a token</span>
        )}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search tokens..."
              className="jupiter-input w-full text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="py-1">
            {filtered.map((token) => (
              <button
                key={token.address}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                onClick={() => handleTokenSelect(token)}
              >
                <div className="w-6 h-6 mr-2 rounded-full overflow-hidden">
                  <Image 
                    src={imageFallback[token.address] ? DEFAULT_TOKEN_ICON : token.logoURI}
                    alt={token.symbol}
                    width={24}
                    height={24}
                    className="object-contain"
                    onError={() => handleImageError(token.address)}
                  />
                </div>
                <div>
                  <div className="font-medium">{token.symbol}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{token.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenSelector;