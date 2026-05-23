import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, MapPin, Plane, Hotel, Anchor, Map, Loader2, X, Clock } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  type: string;
  city: string;
  display_name: string; // Added for frontend display
  operational_name: string; // Added for driver/admin display
}

interface LocationAutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  context: 'pickup' | 'dropoff'; // Important 6 - Contextual Recents
  onChange: (value: string) => void;
  onSelect: (location: Location | { raw_input: string, is_manual_input: boolean }) => void; // Modified to handle manual input
  icon?: React.ReactNode;
}

// Helper for Session ID (Important 5)
const getSessionId = () => {
  let sid = sessionStorage.getItem('ibb_search_session');
  if (!sid) {
    sid = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('ibb_search_session', sid);
  }
  return sid;
};

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  placeholder,
  value,
  context,
  onChange,
  onSelect,
  icon
}) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Location[]>([]);
  const [recentSearches, setRecentSearches] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showSpinner, setShowSpinner] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const sessionId = useMemo(() => getSessionId(), []);

  // Contextual Storage Key (Important 6)
  const storageKey = `recent_${context}_locations`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch (e) { console.error("Recent parse error"); }
    }
  }, [storageKey]);

  const saveToRecent = (location: Location) => {
    const updated = [location, ...recentSearches.filter(item => item.id !== location.id)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const logSelection = async (location?: Location, position?: number, isManualInput: boolean = false, rawInput?: string, noSelectionReason?: 'no_results' | 'abandoned' | 'cleared' | 'manual_override' | 'timeout') => {
    try {
      fetch('https://ibb-booking-api.ibb-service2006.workers.dev/locations/log-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          query: query,
          location_id: location?.id,
          position: position,
          is_manual_input: isManualInput,
          raw_input: rawInput || query,
          no_selection_reason: noSelectionReason,
        })
      });
    } catch (e) { /* silent log fail */ }
  };

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    const spinnerTimer = setTimeout(() => setShowSpinner(true), 150);

    try {
      const url = new URL('https://ibb-booking-api.ibb-service2006.workers.dev/locations/autocomplete');
      url.searchParams.append('query', searchQuery);
      url.searchParams.append('session_id', sessionId);
      url.searchParams.append('limit', '10');

      const response = await fetch(url.toString(), { signal: abortControllerRef.current.signal });
      const result = await response.json();
      if (result.success) {
        setResults(result.data || []);
        setHighlightedIndex(-1);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') console.error('Fetch error:', error);
    } finally {
      clearTimeout(spinnerTimer);
      setIsLoading(false);
      setShowSpinner(false);
    }
  }, [sessionId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) fetchResults(query);
      else setResults([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, fetchResults]);

  const handleSelect = (location: Location, position: number) => {
    onSelect(location);
    setQuery(location.display_name); // Use display_name for input field
    saveToRecent(location);
    logSelection(location, position);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleManualInput = () => {
    if (query.trim() !== '') {
      onSelect({ raw_input: query, is_manual_input: true });
      logSelection(undefined, undefined, true, query, 'manual_override');
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = query.length < 2 ? recentSearches : results;
    if (!isOpen) {
      if (e.key === 'Enter') {
        handleManualInput(); // Allow manual input on Enter if dropdown is not open
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0) {
        handleSelect(items[highlightedIndex], highlightedIndex);
      } else {
        handleManualInput(); // Allow manual input on Enter if no item is highlighted
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      if (query.trim() !== '' && results.length === 0 && !isLoading) {
        logSelection(undefined, undefined, false, query, 'abandoned'); // Log abandoned on escape if no results and query exists
      } else if (query.trim() === '' && results.length === 0) {
        logSelection(undefined, undefined, false, query, 'cleared'); // Log cleared on escape if empty query
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (query.trim() !== '' && results.length === 0 && !isLoading) {
          logSelection(undefined, undefined, false, query, 'abandoned'); // Log abandoned if user clicks outside and no selection made
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef, query, results, isLoading]);

  const getTypeIcon = (type: string, isRecent?: boolean) => {
    if (isRecent) return <Clock className="w-4 h-4 text-gray-400" />;
    switch (type.toLowerCase()) {
      case 'airport': return <Plane className="w-4 h-4 text-blue-500" />;
      case 'hotel': return <Hotel className="w-4 h-4 text-amber-500" />;
      case 'port':
      case 'pier': return <Anchor className="w-4 h-4 text-cyan-500" />;
      case 'attraction': return <Map className="w-4 h-4 text-green-500" />;
      default: return <MapPin className="w-4 h-4 text-gray-400" />;
    }
  };

  const displayItems = query.length < 2 ? recentSearches : results;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-600 mb-1.5 flex items-center gap-2">
        {icon} {label}
      </label>
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={query}
          autoComplete="off"
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Delay closing to allow click on results
            setTimeout(() => {
              if (!dropdownRef.current?.contains(document.activeElement)) {
                setIsOpen(false);
                if (query.trim() !== '' && results.length === 0 && !isLoading) {
                  logSelection(undefined, undefined, false, query, 'abandoned'); // Log abandoned on blur if no selection made
                }
              }
            }, 100);
          }}
          placeholder={placeholder}
          className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-gold/10 focus:border-gold outline-none transition-all pr-12 text-gray-800 placeholder:text-gray-400 shadow-sm group-hover:border-gray-300"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {showSpinner ? (
            <Loader2 className="w-5 h-5 text-gold animate-spin" />
          ) : query ? (
            <button 
              onClick={() => { 
                setQuery(''); 
                onChange(''); 
                setResults([]); 
                inputRef.current?.focus(); 
                logSelection(undefined, undefined, false, query, 'cleared'); // Log cleared on clear
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Clear input"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          ) : (
            <Search className="w-5 h-5 text-gray-300" />
          )}
        </div>
      </div>

      {/* Dropdown Results */}
      {isOpen && (displayItems.length > 0 || (query.length >= 2 && !isLoading)) && (
        <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-[50vh] overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] bg-gray-50/50 border-b border-gray-50">
              Recent {context} locations
            </div>
          )}

          {displayItems.map((loc, index) => (
            <button
              key={`${loc.id}-${index}`}
              onClick={() => handleSelect(loc, index)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full flex items-center gap-4 px-5 py-4 transition-all border-b border-gray-50 last:border-0 text-left ${
                highlightedIndex === index ? 'bg-gold/[0.03]' : 'hover:bg-gray-50/50'
              }`}
            >
              <div className={`p-2.5 rounded-xl transition-colors ${highlightedIndex === index ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
                {getTypeIcon(loc.type, query.length < 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 truncate text-[15px]">{loc.display_name}</div>
                <div className="text-[11px] font-bold text-gray-400 uppercase mt-0.5 tracking-wider flex items-center gap-2">
                  <span className="text-gold">{loc.type.replace('_', ' ')}</span>
                  <span className="text-gray-200">•</span>
                  <span className="truncate">{loc.city}</span>
                </div>
              </div>
            </button>
          ))}

          {query.length >= 2 && results.length === 0 && !isLoading && (
            <div className="p-10 text-center">
              <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
                <Search className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-base text-gray-600 font-bold">No results for "{query}"</p>
              <p className="text-sm text-gray-400 mt-1">Check spelling or try a city name</p>
              <button 
                onClick={handleManualInput}
                className="mt-4 px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors"
              >
                Use "{query}" as manual input
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
