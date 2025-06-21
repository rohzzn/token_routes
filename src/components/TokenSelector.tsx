// TokenSelector: Autocomplete input for SPL tokens using Jupiter Token API
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";

// Default generic token icon as fallback
const DEFAULT_TOKEN_ICON = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMjRDMTguNjI3NCAyNCAyNCAyNCAyNCAxN0MyNCAxMCAyNCA1LjM3MjU4IDE3IDVDMTAgNC42Mjc0MSA0IDEwIDQgMTdDNCAxNyA0IDI0IDEyIDI0WiIgZmlsbD0iI0NDRDJFOSIvPjxwYXRoIGQ9Ik0xMiAyNEMxOC42Mjc0IDI0IDE5IDE4LjYyNzQgMTkgMTJDMTkgNS4zNzI1OCAxOC42Mjc0IDAgMTIgMEM1LjM3MjU4IDAgNSA1LjM3MjU4IDUgMTJDNSAxOC42Mjc0IDUuMzcyNTggMjQgMTIgMjRaIiBmaWxsPSIjODg5RkIwIi8+PC9zdmc+";

export type TokenInfo = {
  address: string;
  symbol: string;
  name: string;
  logoURI: string;
  decimals: number;
};

type TokenSelectorProps = {
  label: string;
  onSelect: (token: TokenInfo) => void;
};

const TokenSelector: React.FC<TokenSelectorProps> = ({ label, onSelect }) => {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState<TokenInfo[]>([]);
  const [selected, setSelected] = useState<TokenInfo | null>(null);
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
    if (query.trim() === '') {
      // Show favorites or popular tokens when no query
      const favoritesTokens = tokens.filter(t => favorites.includes(t.address));
      setFiltered(favoritesTokens.length > 0 ? favoritesTokens : tokens.slice(0, 5));
    } else {
      setFiltered(
        tokens.filter(
          (t) =>
            t.symbol.toLowerCase().includes(query.toLowerCase()) ||
            t.name.toLowerCase().includes(query.toLowerCase()) ||
            t.address.toLowerCase() === query.toLowerCase()
        ).slice(0, 10)
      );
    }
  }, [query, tokens, favorites]);

  const toggleFavorite = (address: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newFavorites = favorites.includes(address)
      ? favorites.filter(f => f !== address)
      : [...favorites, address];
    setFavorites(newFavorites);
    localStorage.setItem('tokenFavorites', JSON.stringify(newFavorites));
  };

  const handleSelect = (token: TokenInfo) => {
    setSelected(token);
    setQuery(token.symbol);
    setIsOpen(false);
    onSelect(token);
  };

  const handleImageError = (address: string) => {
    setImageFallback(prev => ({ ...prev, [address]: true }));
  };

  return (
    <div className="dropdown-container w-full" ref={dropdownRef}>
      <label className="block mb-2 text-sm font-medium">{label}</label>
      <div 
        ref={selectedLabelRef}
        className="flex items-center gap-2 p-2 border border-slate-700 rounded-lg bg-slate-800/50 dark:bg-slate-800/50 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected ? (
          <>
            <div className="relative w-6 h-6 rounded-full overflow-hidden">
              <Image 
                src={imageFallback[selected.address] ? DEFAULT_TOKEN_ICON : selected.logoURI}
                alt={selected.symbol}
                width={24}
                height={24}
                className="rounded-full"
                onError={() => handleImageError(selected.address)}
                unoptimized
              />
            </div>
            <div>
              <div className="font-medium">{selected.symbol}</div>
              <div className="text-xs text-slate-400">{selected.name}</div>
            </div>
          </>
        ) : (
          <div className="text-slate-400">Select a token</div>
        )}
      </div>
      
      {isOpen && <div className="dropdown-backdrop" onClick={() => setIsOpen(false)}></div>}
      
      {isOpen && (
        <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-medium mb-2">Select a token</h3>
            <input
              type="text"
              placeholder="Search by name or address"
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          
          {loading && (
            <div className="text-center py-8 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              Loading tokens...
            </div>
          )}
          
          {!loading && filtered.length === 0 && (
            <div className="text-center py-8 text-slate-400">No tokens found</div>
          )}
          
          <ul className="p-2">
            {filtered.map((token) => (
              <li
                key={token.address}
                className="flex items-center justify-between p-3 hover:bg-slate-700/50 rounded-lg cursor-pointer mb-1"
                onClick={() => handleSelect(token)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    <Image 
                      src={imageFallback[token.address] ? DEFAULT_TOKEN_ICON : token.logoURI}
                      alt={token.symbol}
                      width={32}
                      height={32}
                      className="rounded-full"
                      onError={() => handleImageError(token.address)}
                      unoptimized
                    />
                  </div>
                  <div>
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-xs text-slate-400">{token.name}</div>
                  </div>
                </div>
                
                <button
                  onClick={(e) => toggleFavorite(token.address, e)}
                  className="p-2 text-xl text-slate-400 hover:text-yellow-400"
                >
                  {favorites.includes(token.address) ? '★' : '☆'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TokenSelector;